import dbConnect from '@/lib/mongodb';
import Expense, { IExpense } from '@/models/Expense';
import { ExpenseType } from '@/types/expense';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import mongoose from 'mongoose';

export async function getAllExpenses() {
    await dbConnect();
    return await Expense.find({}).populate('vehicleId').populate('tripId');
}

export async function createExpense(data: Partial<IExpense>) {
    await dbConnect();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const expense = new Expense(data);
        await expense.save({ session });

        // Maintenance Rule
        if (data.type === ExpenseType.MAINTENANCE) {
            await Vehicle.findByIdAndUpdate(data.vehicleId, {
                status: VehicleStatus.IN_SHOP
            }, { session });
        }

        await session.commitTransaction();
        return expense;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function completeMaintenance(vehicleId: string) {
    await dbConnect();
    await Vehicle.findByIdAndUpdate(vehicleId, { status: VehicleStatus.AVAILABLE });
    return { message: 'Maintenance completed' };
}
