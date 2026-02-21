import * as z from "zod";
import { ExpenseType } from "@/types/expense";

export const expenseSchema = z
    .object({
        vehicleId: z.string().min(1, "Vehicle is required"),
        tripId: z.string().optional(),
        type: z.nativeEnum(ExpenseType),

        liters: z
            .union([
                z.coerce.number().positive("Liters must be positive"),
                z.undefined(),
                z.nan(),
            ])
            .optional(),

        cost: z.coerce.number().positive("Cost must be positive"),

        description: z.string().min(2, "Description is required"),

        date: z.coerce.date(),
    })
    .superRefine((data, ctx) => {
        if (data.type === ExpenseType.FUEL) {
            if (!data.liters || data.liters <= 0) {
                ctx.addIssue({
                    path: ["liters"],
                    code: z.ZodIssueCode.custom,
                    message: "Liters is required for fuel expenses",
                });
            }
        }
    });

export type ExpenseFormValues = z.infer<typeof expenseSchema>;