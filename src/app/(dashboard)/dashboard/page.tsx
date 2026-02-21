'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Truck,
    AlertTriangle,
    Activity,
    Package,
    Users,
    MapPin,
    Bell,
    RefreshCw,
    ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
    () => import('recharts').then((mod) => mod.ResponsiveContainer),
    { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), {
    ssr: false,
});
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), {
    ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
    ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
    ssr: false,
});
const CartesianGrid = dynamic(
    () => import('recharts').then((mod) => mod.CartesianGrid),
    { ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
    ssr: false,
});

interface FleetOverviewItem {
    status: string;
    count: number;
    label: string;
}

interface RecentTripSummary {
    id: string;
    origin: string;
    destination: string;
    status: string;
    revenue: number;
    vehicleName?: string;
    driverName?: string;
    createdAt: string;
}

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    entityType: string;
    href: string;
    read: boolean;
    createdAt: string;
}

interface DashboardData {
    kpis: {
        activeFleet: number;
        maintenanceAlerts: number;
        utilizationRate: number;
        pendingCargo: number;
        totalVehicles?: number;
        totalDrivers?: number;
        availableDrivers?: number;
        dispatchedTrips?: number;
    };
    fleetOverview: FleetOverviewItem[];
    recentTrips: RecentTripSummary[];
    recentActivity: { items: ActivityItem[] };
}

const STATUS_COLORS: Record<string, string> = {
    available: '#3b82f6',
    on_trip: '#22c55e',
    in_shop: '#f59e0b',
    retired: '#64748b',
};

const TRIP_STATUS_BADGE: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    dispatched: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<DashboardData>('/api/analytics/dashboard');
            setData(response.data);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.error ?? err.message
                : 'Failed to load dashboard';
            setError(msg);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const kpis = data?.kpis ?? {
        activeFleet: 0,
        maintenanceAlerts: 0,
        utilizationRate: 0,
        pendingCargo: 0,
        totalVehicles: 0,
        totalDrivers: 0,
        availableDrivers: 0,
        dispatchedTrips: 0,
    };

    const cards = [
        {
            title: 'Active Fleet',
            value: kpis.activeFleet,
            subtitle: `${kpis.totalVehicles ?? 0} total vehicles`,
            icon: Truck,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'Maintenance Alerts',
            value: kpis.maintenanceAlerts,
            subtitle: 'Vehicles in shop',
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            title: 'Utilization Rate',
            value: `${kpis.utilizationRate}%`,
            subtitle: 'On trip / fleet',
            icon: Activity,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            title: 'Pending Cargo',
            value: kpis.pendingCargo,
            subtitle: `${kpis.dispatchedTrips ?? 0} in progress`,
            icon: Package,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            title: 'Total Drivers',
            value: kpis.totalDrivers ?? 0,
            subtitle: `${kpis.availableDrivers ?? 0} available`,
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
    ];

    const fleetOverview = data?.fleetOverview ?? [];
    const recentTrips = data?.recentTrips ?? [];
    const recentActivity = data?.recentActivity?.items ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Dashboard
                    </h1>
                    <p className="text-slate-500">
                        Real-time overview of your fleet operations.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboard}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {cards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {card.title}
                            </CardTitle>
                            <card.icon
                                className={`h-4 w-4 ${card.color}`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {loading ? '...' : card.value}
                            </div>
                            {card.subtitle && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {card.subtitle}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Fleet Distribution</CardTitle>
                        <p className="text-sm text-slate-500">
                            Vehicles by status
                        </p>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Loading...
                            </div>
                        ) : fleetOverview.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">
                                No vehicles yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={fleetOverview}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 12 }}
                                        stroke="#64748b"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#64748b"
                                        allowDecimals={false}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="count"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <p className="text-sm text-slate-500">
                            Latest updates across fleet
                        </p>
                    </CardHeader>
                    <CardContent className="h-[280px] overflow-y-auto">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Loading...
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">
                                No recent activity
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {recentActivity.map((item: ActivityItem) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.href}
                                            className={`block rounded-lg border p-3 transition-colors hover:bg-slate-50 ${!item.read ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <Bell
                                                    className={`h-4 w-4 mt-0.5 shrink-0 ${!item.read
                                                            ? 'text-blue-600'
                                                            : 'text-slate-400'
                                                        }`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {formatDate(item.createdAt)}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Trips</CardTitle>
                        <p className="text-sm text-slate-500">
                            Latest trip activity
                        </p>
                    </div>
                    <Link href="/trips">
                        <Button variant="outline" size="sm">
                            View all
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-8 text-center text-slate-400">
                            Loading...
                        </div>
                    ) : recentTrips.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 italic">
                            No trips yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-slate-500">
                                        <th className="pb-3 font-medium">Route</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Revenue</th>
                                        <th className="pb-3 font-medium">Vehicle</th>
                                        <th className="pb-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTrips.map((trip: RecentTripSummary) => (
                                        <tr
                                            key={trip.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-3">
                                                <Link
                                                    href={`/trips`}
                                                    className="flex items-center gap-1 text-slate-900 hover:text-blue-600"
                                                >
                                                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                                    <span>
                                                        {trip.origin} →{' '}
                                                        {trip.destination}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TRIP_STATUS_BADGE[
                                                        trip.status
                                                        ] ?? 'bg-slate-100 text-slate-700'
                                                        }`}
                                                >
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td className="py-3 font-medium">
                                                $
                                                {trip.revenue.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-slate-600">
                                                {trip.vehicleName ?? '—'}
                                            </td>
                                            <td className="py-3 text-slate-500">
                                                {formatDate(trip.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
