'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, Fuel, BarChart2 } from 'lucide-react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { motion, type Variants } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.4, ease: EASE },
    }),
};

const chartReveal: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.25 + i * 0.1, duration: 0.45, ease: EASE },
    }),
};

function RevenueTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80 px-4 py-3 min-w-[148px]">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                {label}
            </p>
            <p className="text-lg font-bold text-blue-600">
                ${Number(payload[0].value).toLocaleString()}
            </p>
        </div>
    );
}

function CostTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80 px-4 py-3 min-w-[164px]">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1 truncate max-w-[148px]">
                {label}
            </p>
            <p className="text-lg font-bold text-red-500">
                ${Number(payload[0].value).toLocaleString()}
            </p>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
            <div className="flex items-start justify-between mb-5">
                <div className="h-3 w-28 rounded-full bg-slate-100" />
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-9 w-32 rounded-lg bg-slate-100 mb-2" />
            <div className="h-3 w-20 rounded-full bg-slate-100" />
        </div>
    );
}

function SkeletonChart({ height = 300 }: { height?: number }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
            <div className="mb-6">
                <div className="h-4 w-44 rounded-full bg-slate-100 mb-2" />
                <div className="h-3 w-60 rounded-full bg-slate-100" />
            </div>
            <div className="rounded-xl bg-slate-50 w-full" style={{ height }} />
        </div>
    );
}

function RoundedBar(props: any) {
    const { x, y, width, height, fill } = props;
    const r = 5;
    if (!height || height <= 0) return null;
    return (
        <path
            d={`M${x + r},${y} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - r} h${-width} v${-(height - r)} a${r},${r} 0 0 1 ${r},${-r}z`}
            fill={fill}
        />
    );
}

function RoundedBarH(props: any) {
    const { x, y, width, height, fill } = props;
    const r = 5;
    if (!width || width <= 0) return null;
    return (
        <path
            d={`M${x},${y + r} a${r},${r} 0 0 1 ${r},${-r} h${width - r} v${height} h${-(width - r)} a${r},${r} 0 0 1 ${-r},${-r}z`}
            fill={fill}
        />
    );
}

export default function Analytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/analytics/reports');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const downloadCSV = async () => {
        try {
            setExporting(true);
            window.open('/api/analytics/export', '_blank');
        } catch (error) {
            console.error('Error exporting CSV:', error);
        } finally {
            setTimeout(() => setExporting(false), 1000);
        }
    };

    const avgROI = (
        data?.roiData?.reduce((acc: number, curr: any) => acc + curr.roi, 0) /
        (data?.roiData?.length || 1)
    ).toFixed(2);

    const avgFuel = (
        data?.fuelEfficiency?.reduce((acc: number, curr: any) => acc + curr.efficiency, 0) /
        (data?.fuelEfficiency?.length || 1)
    ).toFixed(2);

    const kpis = [
        {
            label: 'Average Vehicle ROI',
            value: `${avgROI}x`,
            context: 'Across all active fleet units',
            Icon: TrendingUp,
            accent: 'blue' as const,
        },
        {
            label: 'Avg Fuel Efficiency',
            value: `${avgFuel} km/L`,
            context: 'Fleet-wide consumption average',
            Icon: Fuel,
            accent: 'emerald' as const,
        },
    ];

    const accentMap = {
        blue: { badge: 'bg-blue-50 border border-blue-100', icon: 'text-blue-500' },
        emerald: { badge: 'bg-emerald-50 border border-emerald-100', icon: 'text-emerald-500' },
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">
                            Fleet Intelligence
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Analytics & Reports
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 max-w-lg">
                        Deep-dive into performance metrics, ROI signals, and cost intelligence across your fleet operations.
                    </p>
                </div>

                <button
                    onClick={downloadCSV}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md disabled:cursor-wait disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    {exporting ? 'Exporting…' : 'Export CSV'}
                </button>
            </div>

            {/* KPI Strip */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kpis.map(({ label, value, context, Icon, accent }, i) => {
                        const styles = accentMap[accent];
                        return (
                            <motion.div
                                key={label}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={fadeUp}
                                whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                                        {label}
                                    </p>
                                    <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${styles.badge}`}>
                                        <Icon className={`h-5 w-5 ${styles.icon}`} />
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-2">
                                    {value}
                                </p>
                                <p className="text-xs text-slate-400">{context}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Charts */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonChart height={280} />
                    <SkeletonChart height={280} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Revenue Chart */}
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={chartReveal}
                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-6">
                            <h2 className="text-sm font-semibold text-slate-900">Monthly Revenue vs Expenses</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Revenue trend across all reporting periods</p>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.financials?.monthlyFinancials}
                                    barCategoryGap="40%"
                                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={8}
                                    />
                                    <YAxis
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)', radius: 6 }} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="url(#revenueGradient)"
                                        shape={<RoundedBar />}
                                        activeBar={<RoundedBar fill="#2563eb" />}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Costliest Vehicles Chart */}
                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={chartReveal}
                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-6">
                            <h2 className="text-sm font-semibold text-slate-900">Top 5 Costliest Vehicles</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Ranked by total maintenance and operational cost</p>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.topCostly}
                                    layout="vertical"
                                    barCategoryGap="32%"
                                    margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="costGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#fca5a5" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                    />
                                    <YAxis
                                        dataKey="vehicleInfo.name"
                                        type="category"
                                        width={112}
                                        tick={({ x, y, payload }: any) => (
                                            <text
                                                x={x}
                                                y={y}
                                                dy={4}
                                                textAnchor="end"
                                                fill="#64748b"
                                                fontSize={11}
                                                fontWeight={500}
                                            >
                                                {payload.value?.length > 14
                                                    ? `${payload.value.slice(0, 13)}…`
                                                    : payload.value}
                                            </text>
                                        )}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CostTooltip />} cursor={{ fill: 'rgba(239,68,68,0.04)', radius: 6 }} />
                                    <Bar
                                        dataKey="totalCost"
                                        fill="url(#costGradient)"
                                        shape={<RoundedBarH />}
                                        activeBar={<RoundedBarH fill="#dc2626" />}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                </div>
            )}

        </div>
    );
}