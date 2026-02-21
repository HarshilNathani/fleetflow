import * as z from 'zod';
import { TripStatus } from '@/types/trip';

export const tripSchema = z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    driverId: z.string().min(1, 'Driver is required'),
    origin: z.string().min(2, 'Origin is required'),
    destination: z.string().min(2, 'Destination is required'),
    cargoWeight: z.coerce.number().positive('Cargo weight must be positive'),
    revenue: z.coerce.number().positive('Revenue must be positive'),
    startOdometer: z.coerce.number().nonnegative('Start odometer must be non-negative'),
    status: z.nativeEnum(TripStatus).default(TripStatus.DRAFT),
});

export type TripFormValues = z.infer<typeof tripSchema>;
