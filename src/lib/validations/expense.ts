import * as z from 'zod';
import { ExpenseType } from '@/models/Expense';

export const expenseSchema = z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    tripId: z.string().optional(),
    type: z.nativeEnum(ExpenseType),
    liters: z.coerce.number().positive('Liters must be positive').optional(),
    cost: z.coerce.number().positive('Cost must be positive'),
    description: z.string().min(2, 'Description is required'),
    date: z.coerce.date().default(() => new Date()),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
