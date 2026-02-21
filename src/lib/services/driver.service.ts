import dbConnect from '@/lib/mongodb';
import Driver, { IDriver } from '@/models/Driver';
import { DriverStatus } from '@/types/driver';

export interface DriverFilters {
    search?: string;
    status?: string;
}

export async function getAllDrivers(filters?: DriverFilters) {
    await dbConnect();
    const query: Record<string, unknown> = {};

    if (filters?.search?.trim()) {
        const search = filters.search.trim();
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { licenseNumber: { $regex: search, $options: 'i' } },
        ];
    }

    if (filters?.status?.trim()) {
        query.status = filters.status.trim();
    }

    return await Driver.find(query).sort({ createdAt: -1 });
}

export async function createDriver(data: Partial<IDriver>) {
    await dbConnect();
    const driver = new Driver(data);
    return await driver.save();
}

export async function getDriverById(id: string) {
    await dbConnect();
    return await Driver.findById(id);
}

export async function updateDriver(id: string, data: Partial<IDriver>) {
    await dbConnect();
    return await Driver.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteDriver(id: string) {
    await dbConnect();
    return await Driver.findByIdAndDelete(id);
}