import { UserRole } from './user';

export type ActivityEntityType = 'trip' | 'vehicle' | 'driver' | 'expense';

export type ActivityType =
    | 'trip_created'
    | 'trip_dispatched'
    | 'trip_completed'
    | 'trip_cancelled'
    | 'vehicle_status_change'
    | 'vehicle_maintenance_complete'
    | 'driver_status_change'
    | 'expense_fuel'
    | 'expense_maintenance';

export interface ActivityMetadata {
    tripId?: string;
    vehiclePlate?: string;
    vehicleName?: string;
    driverName?: string;
    expenseType?: string;
    fromStatus?: string;
    toStatus?: string;
    [key: string]: unknown;
}
