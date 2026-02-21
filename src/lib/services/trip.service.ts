import dbConnect from '@/lib/mongodb';
import Trip, { ITrip } from '@/models/Trip';
import { TripStatus } from '@/types/trip';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import Driver from '@/models/Driver';
import { DriverStatus } from '@/types/driver';
import mongoose from 'mongoose';

export async function getAllTrips(vehicleId?: string) {
    await dbConnect();
    const query = vehicleId ? { vehicleId } : {};
    return await Trip.find(query)
        .sort({ createdAt: -1 })
        .populate('vehicleId')
        .populate('driverId');
}

export async function createTrip(data: Partial<ITrip>) {
    await dbConnect();

    // Business Rules Validation
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
    return await trip.save();
}

export async function dispatchTrip(id: string) {
    await dbConnect();

    const trip = await Trip.findById(id);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== TripStatus.DRAFT) throw new Error('Only draft trips can be dispatched');

    trip.status = TripStatus.DISPATCHED;
    await trip.save();

    await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.ON_TRIP });
    await Driver.findByIdAndUpdate(trip.driverId, { status: DriverStatus.ON_TRIP });

    return trip;
}

export async function completeTrip(id: string, endOdometer: number) {
    await dbConnect();

    const trip = await Trip.findById(id);
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

    return trip;
}

export async function cancelTrip(id: string) {
    await dbConnect();
    return await Trip.findByIdAndUpdate(id, { status: TripStatus.CANCELLED }, { new: true });
}
