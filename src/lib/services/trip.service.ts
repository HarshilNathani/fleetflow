import dbConnect from '@/lib/mongodb';
import Trip, { ITrip } from '@/models/Trip';
import { TripStatus } from '@/types/trip';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import Driver from '@/models/Driver';
import { DriverStatus } from '@/types/driver';
import mongoose from 'mongoose';
import { createActivity, getTargetRolesForEntity } from './activity.service';
import { UserRole } from '@/types/user';

export interface ActorContext {
    userId: string;
    role: UserRole;
}

export interface TripFilters {
    vehicleId?: string;
    driverId?: string;
    status?: string;
    search?: string;
}

export async function getAllTrips(filters?: TripFilters | string) {
    await dbConnect();
    const query: Record<string, unknown> = {};

    // Support legacy vehicleId string param (used by ExpenseForm)
    const resolvedFilters: TripFilters | undefined =
        typeof filters === 'string' ? { vehicleId: filters } : filters;

    if (resolvedFilters?.vehicleId) {
        query.vehicleId = resolvedFilters.vehicleId;
    }
    if (resolvedFilters?.driverId) {
        query.driverId = resolvedFilters.driverId;
    }
    if (resolvedFilters?.status?.trim()) {
        query.status = resolvedFilters.status.trim();
    }
    if (resolvedFilters?.search?.trim()) {
        const search = resolvedFilters.search.trim();
        query.$or = [
            { origin: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } },
        ];
    }

    return await Trip.find(query)
        .sort({ createdAt: -1 })
        .populate('vehicleId')
        .populate('driverId');
}

export async function createTrip(data: Partial<ITrip>, actor?: ActorContext) {
    await dbConnect();

    const vehicle = await Vehicle.findById(data.vehicleId);
    const driver = await Driver.findById(data.driverId);

    if (!vehicle || !driver) {
        throw new Error('Vehicle or Driver not found');
    }

    if (data.cargoWeight! > vehicle.maxCapacity) {
        throw new Error(`Cargo weight exceeds vehicle capacity (${vehicle.maxCapacity} kg)`);
    }

    if (vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new Error('Vehicle is not available');
    }

    if (driver.status !== DriverStatus.AVAILABLE) {
        throw new Error('Driver is not available');
    }

    if (new Date(driver.licenseExpiry) < new Date()) {
        throw new Error('Driver license is expired');
    }

    if (!driver.allowedVehicleTypes.includes(vehicle.type)) {
        throw new Error(`Driver is not authorized to drive ${vehicle.type}`);
    }

    const trip = new Trip(data);
    const saved = await trip.save();

    if (actor) {
        const tripRef = `TR-${saved._id.toString().slice(-6).toUpperCase()}`;
        await createActivity({
            type: 'trip_created',
            title: `Trip ${tripRef} created`,
            description: `${vehicle.name} (${vehicle.licensePlate}) → ${data.origin} to ${data.destination}`,
            entityType: 'trip',
            entityId: saved._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('trip', 'trip_created'),
            metadata: {
                vehicleName: vehicle.name,
                vehiclePlate: vehicle.licensePlate,
                driverName: driver.name,
                origin: data.origin,
                destination: data.destination,
            },
        });
    }

    return saved;
}

export async function dispatchTrip(id: string, actor?: ActorContext) {
    await dbConnect();

    const trip = await Trip.findById(id).populate('vehicleId').populate('driverId');
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== TripStatus.DRAFT) throw new Error('Only draft trips can be dispatched');

    trip.status = TripStatus.DISPATCHED;
    await trip.save();

    await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.ON_TRIP });
    await Driver.findByIdAndUpdate(trip.driverId, { status: DriverStatus.ON_TRIP });

    if (actor) {
        const vehicle = trip.vehicleId as { name?: string; licensePlate?: string };
        const driver = trip.driverId as { name?: string };
        const tripRef = `TR-${trip._id.toString().slice(-6).toUpperCase()}`;
        await createActivity({
            type: 'trip_dispatched',
            title: `Trip ${tripRef} dispatched`,
            description: `${vehicle?.name || 'Vehicle'} (${vehicle?.licensePlate || ''}) with ${driver?.name || 'driver'} to ${trip.origin} → ${trip.destination}`,
            entityType: 'trip',
            entityId: trip._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('trip', 'trip_dispatched'),
            metadata: {
                vehicleName: vehicle?.name,
                vehiclePlate: vehicle?.licensePlate,
                driverName: driver?.name,
                origin: trip.origin,
                destination: trip.destination,
            },
        });
    }

    return trip;
}

export async function completeTrip(id: string, endOdometer: number, actor?: ActorContext) {
    await dbConnect();

    const trip = await Trip.findById(id).populate('vehicleId').populate('driverId');
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== TripStatus.DISPATCHED) throw new Error('Only dispatched trips can be completed');

    if (endOdometer <= trip.startOdometer) {
        throw new Error('End odometer must be greater than start odometer');
    }

    trip.status = TripStatus.COMPLETED;
    trip.endOdometer = endOdometer;
    await trip.save();

    await Vehicle.findByIdAndUpdate(trip.vehicleId, {
        status: VehicleStatus.AVAILABLE,
        odometer: endOdometer
    });

    await Driver.findByIdAndUpdate(trip.driverId, { status: DriverStatus.AVAILABLE });

    if (actor) {
        const vehicle = trip.vehicleId as { name?: string; licensePlate?: string };
        const tripRef = `TR-${trip._id.toString().slice(-6).toUpperCase()}`;
        await createActivity({
            type: 'trip_completed',
            title: `Trip ${tripRef} completed`,
            description: `${vehicle?.name || 'Vehicle'} returned, odometer ${trip.startOdometer} → ${endOdometer} km`,
            entityType: 'trip',
            entityId: trip._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('trip', 'trip_completed'),
            metadata: {
                vehiclePlate: vehicle?.licensePlate,
                revenue: trip.revenue,
                endOdometer,
            },
        });
    }

    return trip;
}

export async function cancelTrip(id: string, actor?: ActorContext) {
    await dbConnect();
    const trip = await Trip.findByIdAndUpdate(id, { status: TripStatus.CANCELLED }, { new: true })
        .populate('vehicleId').populate('driverId');
    if (trip && actor) {
        const vehicle = trip.vehicleId as { name?: string; licensePlate?: string };
        const tripRef = `TR-${trip._id.toString().slice(-6).toUpperCase()}`;
        await createActivity({
            type: 'trip_cancelled',
            title: `Trip ${tripRef} cancelled`,
            description: `${vehicle?.name || 'Vehicle'} ${trip.origin} → ${trip.destination}`,
            entityType: 'trip',
            entityId: trip._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('trip', 'trip_cancelled'),
            metadata: { vehiclePlate: vehicle?.licensePlate },
        });
    }
    return trip;
}
