import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import Trip from '@/models/Trip';
import { TripStatus } from '@/types/trip';
import Driver from '@/models/Driver';
import { DriverStatus } from '@/types/driver';
import Expense from '@/models/Expense';
import { ExpenseType } from '@/types/expense';
import { getActivities } from './activity.service';
import { UserRole } from '@/types/user';

export async function getDashboardKPIs() {
    await dbConnect();

    const [activeFleet, maintenanceAlerts, totalVehicles, pendingCargo, totalDrivers, availableDrivers, dispatchedTrips] =
        await Promise.all([
            Vehicle.countDocuments({ status: VehicleStatus.ON_TRIP }),
            Vehicle.countDocuments({ status: VehicleStatus.IN_SHOP }),
            Vehicle.countDocuments({ status: { $ne: VehicleStatus.RETIRED } }),
            Trip.countDocuments({ status: TripStatus.DRAFT }),
            Driver.countDocuments({ status: { $ne: DriverStatus.SUSPENDED } }),
            Driver.countDocuments({ status: DriverStatus.AVAILABLE }),
            Trip.countDocuments({ status: TripStatus.DISPATCHED }),
        ]);

    const activeVehicles = totalVehicles > 0 ? totalVehicles : 1;
    const utilizationRate = Math.round((activeFleet / activeVehicles) * 100);

    return {
        activeFleet,
        maintenanceAlerts,
        utilizationRate,
        pendingCargo,
        totalVehicles,
        totalDrivers,
        availableDrivers,
        dispatchedTrips,
    };
}

export interface FleetOverviewItem {
    status: string;
    count: number;
    label: string;
}

export async function getFleetOverview(): Promise<FleetOverviewItem[]> {
    await dbConnect();

    const [available, onTrip, inShop, retired] = await Promise.all([
        Vehicle.countDocuments({ status: VehicleStatus.AVAILABLE }),
        Vehicle.countDocuments({ status: VehicleStatus.ON_TRIP }),
        Vehicle.countDocuments({ status: VehicleStatus.IN_SHOP }),
        Vehicle.countDocuments({ status: VehicleStatus.RETIRED }),
    ]);

    return [
        { status: VehicleStatus.AVAILABLE, count: available, label: 'Available' },
        { status: VehicleStatus.ON_TRIP, count: onTrip, label: 'On Trip' },
        { status: VehicleStatus.IN_SHOP, count: inShop, label: 'In Shop' },
        { status: VehicleStatus.RETIRED, count: retired, label: 'Retired' },
    ];
}

export interface RecentTripSummary {
    id: string;
    origin: string;
    destination: string;
    status: string;
    revenue: number;
    vehicleName?: string;
    driverName?: string;
    createdAt: string;
}

export async function getRecentTrips(limit = 5): Promise<RecentTripSummary[]> {
    await dbConnect();

    const trips = await Trip.find({ status: { $in: [TripStatus.DISPATCHED, TripStatus.DRAFT, TripStatus.COMPLETED] } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('vehicleId', 'name licensePlate')
        .populate('driverId', 'name')
        .lean();

    return trips.map((t) => {
        const v = t.vehicleId as { name?: string; licensePlate?: string } | null;
        const d = t.driverId as { name?: string } | null;
        const doc = t as { _id: mongoose.Types.ObjectId; createdAt?: Date };
        return {
            id: String(doc._id),
            origin: t.origin,
            destination: t.destination,
            status: t.status,
            revenue: t.revenue,
            vehicleName: v?.name ?? v?.licensePlate ?? undefined,
            driverName: d?.name ?? undefined,
            createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
        };
    });
}

export interface DashboardData {
    kpis: Awaited<ReturnType<typeof getDashboardKPIs>>;
    fleetOverview: FleetOverviewItem[];
    recentTrips: RecentTripSummary[];
    recentActivity: { items: Awaited<ReturnType<typeof getActivities>>['items'] };
}

export async function getDashboardData(userRole?: UserRole, userId?: string): Promise<DashboardData> {
    const [kpis, fleetOverview, recentTrips, activityResult] = await Promise.all([
        getDashboardKPIs(),
        getFleetOverview(),
        getRecentTrips(5),
        userRole && userId
            ? getActivities({ userRole, userId, limit: 10 })
            : Promise.resolve({ items: [], nextCursor: null }),
    ]);

    return {
        kpis,
        fleetOverview,
        recentTrips,
        recentActivity: { items: activityResult.items },
    };
}

export async function getVehicleAnalytics() {
    await dbConnect();

    // Fuel Efficiency Aggregation
    const fuelEfficiency = await Trip.aggregate([
        { $match: { status: TripStatus.COMPLETED } },
        {
            $lookup: {
                from: 'expenses',
                localField: '_id',
                foreignField: 'tripId',
                as: 'fuelExpenses',
            },
        },
        { $unwind: '$fuelExpenses' },
        { $match: { 'fuelExpenses.type': ExpenseType.FUEL } },
        {
            $group: {
                _id: '$vehicleId',
                totalDistance: { $sum: { $subtract: ['$endOdometer', '$startOdometer'] } },
                totalLiters: { $sum: '$fuelExpenses.liters' },
            },
        },
        {
            $project: {
                efficiency: {
                    $cond: [
                        { $eq: ['$totalLiters', 0] },
                        0,
                        { $divide: ['$totalDistance', '$totalLiters'] },
                    ],
                },
            },
        },
    ]);

    // Vehicle ROI Aggregation
    // ROI = (totalRevenue - totalExpenses) / acquisitionCost
    const roiData = await Vehicle.aggregate([
        {
            $lookup: {
                from: 'trips',
                localField: '_id',
                foreignField: 'vehicleId',
                as: 'vehicleTrips',
            },
        },
        {
            $lookup: {
                from: 'expenses',
                localField: '_id',
                foreignField: 'vehicleId',
                as: 'vehicleExpenses',
            },
        },
        {
            $project: {
                name: 1,
                acquisitionCost: 1,
                totalRevenue: { $sum: '$vehicleTrips.revenue' },
                totalExpenses: { $sum: '$vehicleExpenses.cost' },
            },
        },
        {
            $project: {
                name: 1,
                roi: {
                    $cond: [
                        { $eq: ['$acquisitionCost', 0] },
                        0,
                        { $divide: [{ $subtract: ['$totalRevenue', '$totalExpenses'] }, '$acquisitionCost'] },
                    ],
                },
            },
        },
    ]);

    // Monthly Financial Summary
    const monthlyFinancials = await Trip.aggregate([
        { $match: { status: TripStatus.COMPLETED } },
        {
            $group: {
                _id: { $month: '$createdAt' },
                revenue: { $sum: '$revenue' },
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    const monthlyExpenses = await Expense.aggregate([
        {
            $group: {
                _id: { $month: '$date' },
                cost: { $sum: '$cost' },
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    return {
        fuelEfficiency,
        roiData,
        financials: {
            monthlyFinancials,
            monthlyExpenses
        }
    };
}

export async function getTopCostlyVehicles() {
    await dbConnect();
    return await Expense.aggregate([
        {
            $group: {
                _id: '$vehicleId',
                totalCost: { $sum: '$cost' }
            }
        },
        { $sort: { totalCost: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'vehicles',
                localField: '_id',
                foreignField: '_id',
                as: 'vehicleInfo'
            }
        },
        { $unwind: '$vehicleInfo' }
    ]);
}
