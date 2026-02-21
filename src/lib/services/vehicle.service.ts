import dbConnect from '@/lib/mongodb';
import Vehicle, { IVehicle } from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import { createActivity, getTargetRolesForEntity } from './activity.service';
import { UserRole } from '@/types/user';

export interface ActorContext {
    userId: string;
    role: UserRole;
}

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

export async function updateVehicle(id: string, data: Partial<IVehicle>, actor?: ActorContext) {
    await dbConnect();
    const before = await Vehicle.findById(id);
    const updated = await Vehicle.findByIdAndUpdate(id, data, { new: true });
    if (actor && before && updated && data.status && before.status !== data.status) {
        await createActivity({
            type: 'vehicle_status_change',
            title: `Vehicle ${updated.licensePlate} status changed`,
            description: `${before.status} → ${data.status}`,
            entityType: 'vehicle',
            entityId: updated._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('vehicle', 'vehicle_status_change'),
            metadata: {
                vehiclePlate: updated.licensePlate,
                vehicleName: updated.name,
                fromStatus: before.status,
                toStatus: data.status,
            },
        });
    }
    return updated;
}

export async function deleteVehicle(id: string) {
    await dbConnect();
    return await Vehicle.findByIdAndDelete(id);
}
