import dbConnect from '@/lib/mongodb';
import Trip, { ITrip, TripStatus } from '@/models/Trip';
import Vehicle, { VehicleStatus } from '@/models/Vehicle';
import Driver, { DriverStatus } from '@/models/Driver';
import mongoose from 'mongoose';

export async function getAllTrips() {
    await dbConnect();
    return await Trip.find({}).populate('vehicleId').populate('driverId');
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const trip = await Trip.findById(id).session(session);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== TripStatus.DRAFT) throw new Error('Only draft trips can be dispatched');

        trip.status = TripStatus.DISPATCHED;
        await trip.save({ session });

        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: VehicleStatus.ON_TRIP }, { session });
        await Driver.findByIdAndUpdate(trip.driverId, { status: DriverStatus.ON_TRIP }, { session });

        await session.commitTransaction();
        return trip;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function completeTrip(id: string, endOdometer: number) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const trip = await Trip.findById(id).session(session);
        if (!trip) throw new Error('Trip not found');
        if (trip.status !== TripStatus.DISPATCHED) throw new Error('Only dispatched trips can be completed');

        if (endOdometer <= trip.startOdometer) {
            throw new Error('End odometer must be greater than start odometer');
        }

        trip.status = TripStatus.COMPLETED;
        trip.endOdometer = endOdometer;
        await trip.save({ session });

        await Vehicle.findByIdAndUpdate(trip.vehicleId, {
            status: VehicleStatus.AVAILABLE,
            odometer: endOdometer
        }, { session });

        await Driver.findByIdAndUpdate(trip.driverId, { status: DriverStatus.AVAILABLE }, { session });

        await session.commitTransaction();
        return trip;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function cancelTrip(id: string) {
    await dbConnect();
    return await Trip.findByIdAndUpdate(id, { status: TripStatus.CANCELLED }, { new: true });
}
