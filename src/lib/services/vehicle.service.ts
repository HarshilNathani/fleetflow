import dbConnect from '@/lib/mongodb';
import Vehicle, { IVehicle } from '@/models/Vehicle';
import { VehicleType, VehicleStatus } from '@/types/vehicle';

export interface VehicleFilters {
    search?: string;
    status?: string;
}

export async function getAllVehicles(filters?: VehicleFilters) {
    await dbConnect();
    const query: Record<string, unknown> = {};

    if (filters?.search?.trim()) {
        const search = filters.search.trim();
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
            { licensePlate: { $regex: search, $options: 'i' } },
        ];
    }

    if (filters?.status?.trim()) {
        query.status = filters.status.trim();
    }

    return await Vehicle.find(query).sort({ createdAt: -1 });
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
