import dbConnect from '@/lib/mongodb';
import Driver, { IDriver } from '@/models/Driver';
import { DriverStatus } from '@/types/driver';
import { createActivity, getTargetRolesForEntity } from './activity.service';
import { UserRole } from '@/types/user';

export interface ActorContext {
    userId: string;
    role: UserRole;
}

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

export async function updateDriver(id: string, data: Partial<IDriver>, actor?: ActorContext) {
    await dbConnect();
    const before = await Driver.findById(id);
    const updated = await Driver.findByIdAndUpdate(id, data, { new: true });
    if (actor && before && updated && data.status !== undefined && before.status !== data.status) {
        await createActivity({
            type: 'driver_status_change',
            title: `Driver ${updated.name} status changed`,
            description: `${before.status} → ${data.status}`,
            entityType: 'driver',
            entityId: updated._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('driver', 'driver_status_change'),
            metadata: {
                driverName: updated.name,
                fromStatus: before.status,
                toStatus: data.status,
            },
        });
    }
    return updated;
}

export async function deleteDriver(id: string) {
    await dbConnect();
    return await Driver.findByIdAndDelete(id);
}