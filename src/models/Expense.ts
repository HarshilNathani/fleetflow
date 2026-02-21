import mongoose, { Schema, Document, Model } from 'mongoose';

import { ExpenseType } from '@/types/expense';

export interface IExpense extends Document {
    vehicleId: mongoose.Types.ObjectId;
    tripId?: mongoose.Types.ObjectId;
    type: ExpenseType;
    liters?: number;
    cost: number;
    description: string;
    date: Date;
}

const ExpenseSchema: Schema = new Schema(
    {
        vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
        type: {
            type: String,
            enum: Object.values(ExpenseType),
            required: true,
        },
        liters: { type: Number },
        cost: { type: Number, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now, required: true },
    },
    { timestamps: true }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
