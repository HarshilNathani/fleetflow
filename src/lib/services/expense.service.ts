import dbConnect from '@/lib/mongodb';
import Expense, { IExpense } from '@/models/Expense';
import { ExpenseType } from '@/types/expense';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';

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

export async function createExpense(data: Partial<IExpense>) {
    await dbConnect();

    const expense = new Expense(data);
    await expense.save();

    if (data.type === ExpenseType.MAINTENANCE) {
        await Vehicle.findByIdAndUpdate(data.vehicleId, {
            status: VehicleStatus.IN_SHOP
        });
    }

    return expense;
}

export async function completeMaintenance(vehicleId: string) {
    await dbConnect();
    await Vehicle.findByIdAndUpdate(vehicleId, { status: VehicleStatus.AVAILABLE });
    return { message: 'Maintenance completed' };
}