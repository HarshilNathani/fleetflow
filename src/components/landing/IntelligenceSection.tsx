'use client';

import { motion } from 'framer-motion';
import {
    Route,
    Truck,
    BarChart3,
    Wrench,
    ArrowRight,
    CheckCircle,
    Play,
} from 'lucide-react';
import { ProximityCard } from './ProximityCard';

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ── Trip Dispatch Card ──────────────────────────────────────────────────── */

function TripCard() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-blue-400" />
                    <span className="text-[13px] font-semibold text-white">
                        Trip Dispatch
                    </span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Live
                </span>
            </div>

            <div className="space-y-3">
                {[
                    {
                        vehicle: 'Truck-12',
                        route: 'Mumbai → Pune',
                        status: 'Dispatched',
                        badge: 'bg-blue-500/20 text-blue-400',
                        action: Play,
                    },
                    {
                        vehicle: 'Van-03',
                        route: 'Delhi → Jaipur',
                        status: 'Completed',
                        badge: 'bg-emerald-500/20 text-emerald-400',
                        action: CheckCircle,
                    },
                    {
                        vehicle: 'Truck-08',
                        route: 'Chennai → Bangalore',
                        status: 'Draft',
                        badge: 'bg-slate-500/20 text-slate-400',
                        action: ArrowRight,
                    },
                ].map((trip) => (
                    <div
                        key={trip.vehicle}
                        className="flex items-center justify-between py-2 border-t border-white/[0.04]"
                    >
                        <div>
                            <span className="text-[12px] font-medium text-slate-300">
                                {trip.vehicle}
                            </span>
                            <p className="text-[11px] text-slate-500">
                                {trip.route}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${trip.badge}`}
                            >
                                {trip.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Vehicle Status Card ─────────────────────────────────────────────────── */

function VehicleCard() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-400" />
                    <span className="text-[13px] font-semibold text-white">
                        Fleet Status
                    </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">
                    12 Active
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Available', count: 7, color: 'bg-emerald-400' },
                    { label: 'On Trip', count: 4, color: 'bg-blue-400' },
                    { label: 'In Shop', count: 1, color: 'bg-amber-400' },
                ].map((s) => (
                    <div key={s.label} className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                            <span className="text-lg font-bold text-white">
                                {s.count}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Vehicle list */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                {[
                    { name: 'Van-05', plate: 'MH-12-AB-1234', status: 'Available', color: 'bg-emerald-400' },
                    { name: 'Truck-12', plate: 'DL-01-CD-5678', status: 'On Trip', color: 'bg-blue-400' },
                    { name: 'Van-07', plate: 'KA-03-EF-9012', status: 'On Trip', color: 'bg-blue-400' },
                ].map((v) => (
                    <div
                        key={v.name}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[11px] font-medium text-slate-300">
                                {v.name}
                            </span>
                            <span className="text-[10px] text-slate-600 ml-2">
                                {v.plate}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${v.color}`} />
                            <span className="text-[10px] text-slate-500">
                                {v.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Analytics Card ──────────────────────────────────────────────────────── */

function AnalyticsCard() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    <span className="text-[13px] font-semibold text-white">
                        Analytics
                    </span>
                </div>
                <span className="text-[10px] text-slate-500">This Month</span>
            </div>

            {/* Mini chart */}
            <div className="h-28 flex items-end gap-1">
                {[35, 50, 42, 68, 55, 72, 48, 85, 62, 78, 90, 70].map(
                    (h, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-sm bg-purple-500/25"
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.3 + i * 0.05,
                                ease: EASE,
                            }}
                        />
                    ),
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.04]">
                <div>
                    <span className="text-[10px] text-slate-500">Avg ROI</span>
                    <p className="text-base font-bold text-white">2.4x</p>
                </div>
                <div>
                    <span className="text-[10px] text-slate-500">
                        Fuel Efficiency
                    </span>
                    <p className="text-base font-bold text-white">14.2 km/L</p>
                </div>
            </div>
        </div>
    );
}

/* ── Maintenance Card ────────────────────────────────────────────────────── */

function MaintenanceCard() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-400" />
                    <span className="text-[13px] font-semibold text-white">
                        Maintenance
                    </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    3 Due
                </span>
            </div>

            <div className="space-y-3">
                {[
                    {
                        vehicle: 'Van-05',
                        task: 'Oil Change',
                        due: 'Overdue',
                        urgency: 'text-red-400 bg-red-500/15',
                    },
                    {
                        vehicle: 'Truck-12',
                        task: 'Tire Rotation',
                        due: 'In 3 days',
                        urgency: 'text-amber-400 bg-amber-500/15',
                    },
                    {
                        vehicle: 'Van-03',
                        task: 'Brake Inspection',
                        due: 'In 1 week',
                        urgency: 'text-slate-400 bg-slate-500/15',
                    },
                ].map((item) => (
                    <div
                        key={item.vehicle}
                        className="flex items-center justify-between py-2 border-t border-white/[0.04]"
                    >
                        <div>
                            <span className="text-[12px] font-medium text-slate-300">
                                {item.vehicle}
                            </span>
                            <p className="text-[11px] text-slate-500">
                                {item.task}
                            </p>
                        </div>
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.urgency}`}
                        >
                            {item.due}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Intelligence Section ────────────────────────────────────────────────── */

export function IntelligenceSection() {
    return (
        <section
            id="intelligence"
            className="relative py-32 md:py-40 px-6 bg-slate-950 overflow-hidden"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/[0.02] blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-slate-400/[0.01] blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="text-center mb-16"
                >
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                        Intelligence
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Every layer of your operation,<br />
                        <span className="text-slate-500">visible in one system</span>
                    </h2>
                    <p className="mt-5 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                        From dispatch to delivery. From maintenance to margin.
                        FleetFlow unifies it all.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[TripCard, VehicleCard, AnalyticsCard, MaintenanceCard].map(
                        (Card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{
                                    duration: 0.8,
                                    delay: i * 0.12,
                                    ease: EASE,
                                }}
                            >
                                <ProximityCard className="relative">
                                    <Card />
                                </ProximityCard>
                            </motion.div>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}
