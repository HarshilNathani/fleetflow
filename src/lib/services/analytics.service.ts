import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { VehicleStatus } from '@/types/vehicle';
import Trip from '@/models/Trip';
import { TripStatus } from '@/types/trip';
import Expense from '@/models/Expense';
import { ExpenseType } from '@/types/expense';

export async function getDashboardKPIs() {
    await dbConnect();

    const [activeFleet, maintenanceAlerts, totalVehicles, pendingCargo] = await Promise.all([
        Vehicle.countDocuments({ status: VehicleStatus.ON_TRIP }),
        Vehicle.countDocuments({ status: VehicleStatus.IN_SHOP }),
        Vehicle.countDocuments({}),
        Trip.countDocuments({ status: TripStatus.DRAFT }),
    ]);

    const utilizationRate = totalVehicles > 0 ? (activeFleet / totalVehicles) * 100 : 0;

    return {
        activeFleet,
        maintenanceAlerts,
        utilizationRate: Math.round(utilizationRate),
        pendingCargo,
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
