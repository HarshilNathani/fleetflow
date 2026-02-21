'use client';

import { useState, useEffect } from 'react';
import { Truck, AlertTriangle, Activity, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export default function Dashboard() {
    const [kpis, setKpis] = useState({
        activeFleet: 0,
        maintenanceAlerts: 0,
        utilizationRate: 0,
        pendingCargo: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const response = await axios.get('/api/analytics/kpis');
                setKpis(response.data);
            } catch (error) {
                console.error('Error fetching KPIs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchKPIs();
    }, []);

    const cards = [
        { title: 'Active Fleet', value: kpis.activeFleet, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Maintenance Alerts', value: kpis.maintenanceAlerts, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Utilization Rate', value: `${kpis.utilizationRate}%`, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Pending Cargo', value: kpis.pendingCargo, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Real-time overview of your fleet operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{loading ? '...' : card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for recent activities or charts if needed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-slate-400 italic">
                        Visualizing fleet distribution...
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-slate-400 italic">
                        Connecting to alert stream...
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
