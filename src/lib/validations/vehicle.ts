import * as z from 'zod';
import { VehicleType, VehicleStatus } from '@/types/vehicle';

export const vehicleSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    model: z.string().min(2, 'Model must be at least 2 characters'),
    licensePlate: z.string().min(3, 'License plate must be at least 3 characters'),
    type: z.nativeEnum(VehicleType),
    maxCapacity: z.coerce.number().positive('Capacity must be positive'),
    odometer: z.coerce.number().nonnegative('Odometer must be non-negative'),
    acquisitionCost: z.coerce.number().positive('Cost must be positive'),
    status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
