import { UserRole } from "@/types/user";

export const SIDEBAR_ACCESS = {
    dashboard: [UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY, UserRole.ANALYST],
    vehicles: [UserRole.MANAGER, UserRole.DISPATCHER],//remove add vehicle option for dispatcher
    drivers: [UserRole.MANAGER, UserRole.SAFETY],
    trips: [UserRole.MANAGER, UserRole.DISPATCHER],
    maintenance: [UserRole.MANAGER, UserRole.SAFETY],
    expenses: [UserRole.MANAGER, UserRole.ANALYST],
    analytics: [UserRole.MANAGER, UserRole.ANALYST],
};