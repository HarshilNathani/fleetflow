import dbConnect from '@/lib/mongodb';
import Expense, { IExpense } from '@/models/Expense';
import { ExpenseType } from '@/types/expense';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import { createActivity, getTargetRolesForEntity } from './activity.service';
import { UserRole } from '@/types/user';

export interface ActorContext {
    userId: string;
    role: UserRole;
}

export interface ExpenseFilters {
    search?: string;
    vehicleId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
}

export async function getAllExpenses(filters?: ExpenseFilters) {
    await dbConnect();
    const query: Record<string, unknown> = {};

    if (filters?.search?.trim()) {
        query.description = { $regex: filters.search.trim(), $options: 'i' };
    }
    if (filters?.vehicleId) {
        query.vehicleId = filters.vehicleId;
    }
    if (filters?.type?.trim()) {
        query.type = filters.type.trim();
    }
    if (filters?.dateFrom || filters?.dateTo) {
        query.date = {};
        if (filters.dateFrom) {
            (query.date as Record<string, Date>).$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            const end = new Date(filters.dateTo);
            end.setHours(23, 59, 59, 999);
            (query.date as Record<string, Date>).$lte = end;
        }
    }

    return await Expense.find(query)
        .sort({ date: -1 })
        .populate('vehicleId')
        .populate('tripId');
}

export async function createExpense(data: Partial<IExpense>, actor?: ActorContext) {
    await dbConnect();

    const expense = new Expense(data);
    await expense.save();

    const vehicle = await Vehicle.findById(data.vehicleId);

    if (data.type === ExpenseType.MAINTENANCE) {
        await Vehicle.findByIdAndUpdate(data.vehicleId, {
            status: VehicleStatus.IN_SHOP
        });
    }

    if (actor && vehicle) {
        const isMaintenance = data.type === ExpenseType.MAINTENANCE;
        await createActivity({
            type: isMaintenance ? 'expense_maintenance' : 'expense_fuel',
            title: isMaintenance
                ? `Maintenance logged for ${vehicle.licensePlate}`
                : `Fuel expense logged for ${vehicle.licensePlate}`,
            description: isMaintenance
                ? `${vehicle.name} moved to In Shop`
                : `${data.liters ? `${data.liters}L` : ''} $${data.cost} – ${data.description}`,
            entityType: 'expense',
            entityId: expense._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('expense', isMaintenance ? 'expense_maintenance' : 'expense_fuel'),
            metadata: {
                vehiclePlate: vehicle.licensePlate,
                vehicleName: vehicle.name,
                expenseType: data.type,
                cost: data.cost,
                tripId: data.tripId?.toString(),
            },
        });
    }

    return expense;
}

export async function completeMaintenance(vehicleId: string, actor?: ActorContext) {
    await dbConnect();
    const vehicle = await Vehicle.findById(vehicleId);
    await Vehicle.findByIdAndUpdate(vehicleId, { status: VehicleStatus.AVAILABLE });
    if (actor && vehicle) {
        await createActivity({
            type: 'vehicle_maintenance_complete',
            title: `Vehicle ${vehicle.licensePlate} maintenance complete`,
            description: `${vehicle.name} returned to Available`,
            entityType: 'vehicle',
            entityId: vehicle._id,
            actorRole: actor.role,
            targetRoles: getTargetRolesForEntity('vehicle', 'vehicle_maintenance_complete'),
            metadata: {
                vehiclePlate: vehicle.licensePlate,
                vehicleName: vehicle.name,
                fromStatus: VehicleStatus.IN_SHOP,
                toStatus: VehicleStatus.AVAILABLE,
            },
        });
    }
    return { message: 'Maintenance completed' };
}