import * as z from 'zod';
import { DriverStatus } from '@/types/driver';
import { VehicleType } from '@/types/vehicle';

export const driverSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
    licenseExpiry: z.coerce.date().refine((date) => date > new Date(), {
        message: 'License must not be expired',
    }),
    allowedVehicleTypes: z.array(z.nativeEnum(VehicleType)).min(1, 'Select at least one vehicle type'),
    status: z.nativeEnum(DriverStatus).default(DriverStatus.AVAILABLE),
    safetyScore: z.coerce.number().min(0).max(100).default(100),
});

export type DriverFormValues = z.infer<typeof driverSchema>;
