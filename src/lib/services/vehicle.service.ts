import dbConnect from '@/lib/mongodb';
import Vehicle, { IVehicle } from '@/models/Vehicle';
import { VehicleType, VehicleStatus } from '@/types/vehicle';

export async function getAllVehicles() {
    await dbConnect();
    return await Vehicle.find({});
}

export async function createVehicle(data: Partial<IVehicle>) {
    await dbConnect();
    const vehicle = new Vehicle(data);
    return await vehicle.save();
}

export async function getVehicleById(id: string) {
    await dbConnect();
    return await Vehicle.findById(id);
}

export async function updateVehicle(id: string, data: Partial<IVehicle>) {
    await dbConnect();
    return await Vehicle.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteVehicle(id: string) {
    await dbConnect();
    return await Vehicle.findByIdAndDelete(id);
}
