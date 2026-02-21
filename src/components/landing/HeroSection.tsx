'use client';

import { useRef, useCallback } from 'react';
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
} from 'framer-motion';
import {
    Truck,
    LayoutDashboard,
    Route,
    Users,
    Wrench,
    BarChart3,
    Fuel,
    Activity,
    AlertTriangle,
    Package,
    Clock,
    ArrowRight,
    ChevronDown,
} from 'lucide-react';

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ── Floating indicator card ──────────────────────────────────────────────── */

function FloatingCard({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1 + delay, ease: EASE }}
            className={className}
        >
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                    duration: 5 + delay * 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

/* ── Mini sidebar nav item ────────────────────────────────────────────────── */

function MiniNavItem({
    icon: Icon,
    label,
    active,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] ${
                active
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-500'
            }`}
        >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </div>
    );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0.5);
    const my = useMotionValue(0.5);

    const rotX = useTransform(my, [0, 1], [3, -3]);
    const rotY = useTransform(mx, [0, 1], [-3, 3]);
    const sRotX = useSpring(rotX, { stiffness: 120, damping: 20 });
    const sRotY = useSpring(rotY, { stiffness: 120, damping: 20 });

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const r = containerRef.current?.getBoundingClientRect();
            if (!r) return;
            mx.set((e.clientX - r.left) / r.width);
            my.set((e.clientY - r.top) / r.height);
        },
        [mx, my],
    );

    return (
        <section
            ref={containerRef}
            onMouseMove={onMouseMove}
            className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24 px-6 overflow-hidden bg-slate-950"
        >
            {/* ── Dot grid ───────────────────────────────────── */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* ── Moving light beam ──────────────────────────── */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)',
                }}
                animate={{
                    x: ['-20%', '120%'],
                    y: ['10%', '50%'],
                }}
                transition={{
                    duration: 22,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
            />

            {/* ── Floating indicators (desktop only) ──────── */}
            <FloatingCard
                className="absolute top-[22%] left-[6%] hidden lg:block"
                delay={0}
            >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-slate-900/60 backdrop-blur-sm">
                    <Route className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-[11px] text-slate-300 font-medium">
                        Van-07 &middot; En Route
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </FloatingCard>

            <FloatingCard
                className="absolute top-[30%] right-[5%] hidden lg:block"
                delay={0.6}
            >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-slate-900/60 backdrop-blur-sm">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[11px] text-slate-300 font-medium">
                        Fleet Utilization: 87%
                    </span>
                </div>
            </FloatingCard>

            <FloatingCard
                className="absolute bottom-[32%] left-[8%] hidden lg:block"
                delay={1.2}
            >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-slate-900/60 backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] text-slate-300 font-medium">
                        Next ETA: 2h 14m
                    </span>
                </div>
            </FloatingCard>

            <FloatingCard
                className="absolute bottom-[28%] right-[7%] hidden lg:block"
                delay={0.9}
            >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-slate-900/60 backdrop-blur-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] text-slate-300 font-medium">
                        3 Alerts Active
                    </span>
                </div>
            </FloatingCard>

            {/* ── Headline content ────────────────────────────── */}
            <motion.div
                className="relative z-10 text-center max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
            >
                {/* Status pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
                        System Operational
                    </span>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.08]">
                    The Operating System
                    <br />
                    <span className="text-slate-500">for Modern Fleet Logistics</span>
                </h1>

                <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Real-time fleet intelligence, route optimization, and predictive
                    maintenance&nbsp;&mdash; unified in one command layer.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
                    <a
                        href="/login"
                        className="inline-flex items-center justify-center h-11 px-7 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors gap-2"
                    >
                        Enter Platform
                        <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                        href="#intelligence"
                        className="inline-flex items-center justify-center h-11 px-7 text-sm font-medium text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all gap-2"
                    >
                        Explore
                        <ChevronDown className="h-4 w-4" />
                    </a>
                </div>
            </motion.div>

            {/* ── Dashboard preview with tilt ─────────────────── */}
            <motion.div
                className="relative z-10 mt-16 md:mt-24 w-full max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
                style={{ perspective: 1200 }}
            >
                <motion.div
                    style={{ rotateX: sRotX, rotateY: sRotY }}
                    className="rounded-xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/20"
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-blue-500/[0.06] to-transparent pointer-events-none" />

                    <div className="flex items-center gap-2 px-4 h-10 border-b border-white/[0.06] bg-slate-900/60">
                        <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="h-5 w-56 rounded-md bg-white/[0.04] flex items-center justify-center">
                                <span className="text-[10px] text-slate-600 tracking-wide">
                                    fleetflow.app/dashboard
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[340px] md:min-h-[420px]">
                        <div className="w-48 border-r border-white/[0.06] p-3 space-y-0.5 hidden md:block bg-slate-900/50">
                            <div className="flex items-center gap-2 px-3 py-2.5 mb-4">
                                <div className="bg-blue-600 p-1.5 rounded-lg">
                                    <Truck className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[11px] font-bold text-white/80 tracking-tight">
                                    FleetFlow
                                </span>
                            </div>
                            <MiniNavItem icon={LayoutDashboard} label="Dashboard" active />
                            <MiniNavItem icon={Truck} label="Vehicles" />
                            <MiniNavItem icon={Users} label="Drivers" />
                            <MiniNavItem icon={Route} label="Trips" />
                            <MiniNavItem icon={Wrench} label="Maintenance" />
                            <MiniNavItem icon={Fuel} label="Expenses" />
                            <MiniNavItem icon={BarChart3} label="Analytics" />
                        </div>

                        <div className="flex-1 p-5 md:p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="h-4 w-28 rounded bg-white/[0.1]" />
                                    <div className="h-2.5 w-48 rounded bg-white/[0.04] mt-2" />
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-slate-800/60 border border-white/[0.06]" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    {
                                        label: 'Active Fleet',
                                        value: '12',
                                        icon: Truck,
                                        color: 'text-blue-400',
                                    },
                                    {
                                        label: 'Alerts',
                                        value: '3',
                                        icon: AlertTriangle,
                                        color: 'text-amber-400',
                                    },
                                    {
                                        label: 'Utilization',
                                        value: '87%',
                                        icon: Activity,
                                        color: 'text-emerald-400',
                                    },
                                    {
                                        label: 'Pending',
                                        value: '5',
                                        icon: Package,
                                        color: 'text-purple-400',
                                    },
                                ].map((kpi) => (
                                    <div
                                        key={kpi.label}
                                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-slate-500">
                                                {kpi.label}
                                            </span>
                                            <kpi.icon
                                                className={`h-3 w-3 ${kpi.color}`}
                                            />
                                        </div>
                                        <span className="text-lg font-bold text-white/90">
                                            {kpi.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4 h-36 flex flex-col justify-end">
                                    <div className="flex items-end gap-1.5 h-full">
                                        {[40, 65, 45, 80, 55, 70, 60, 90, 50, 75, 85, 68].map(
                                            (h, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="flex-1 rounded-sm bg-blue-500/30"
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 1.2 + i * 0.06,
                                                        ease: EASE,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4 space-y-2.5">
                                    {[
                                        {
                                            name: 'Van-05',
                                            status: 'Available',
                                            color: 'bg-emerald-400',
                                        },
                                        {
                                            name: 'Truck-12',
                                            status: 'On Trip',
                                            color: 'bg-blue-400',
                                        },
                                        {
                                            name: 'Van-03',
                                            status: 'In Shop',
                                            color: 'bg-amber-400',
                                        },
                                        {
                                            name: 'Truck-08',
                                            status: 'On Trip',
                                            color: 'bg-blue-400',
                                        },
                                    ].map((row) => (
                                        <div
                                            key={row.name}
                                            className="flex items-center justify-between py-1"
                                        >
                                            <span className="text-[11px] text-slate-400">
                                                {row.name}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${row.color}`}
                                                />
                                                <span className="text-[10px] text-slate-500">
                                                    {row.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Reflection / glow underneath */}
                <div className="absolute -bottom-8 inset-x-8 h-32 bg-blue-500/[0.04] blur-3xl rounded-full pointer-events-none" />
            </motion.div>

            {/* ── Scroll indicator ────────────────────────────── */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                </motion.div>
            </motion.div>
        </section>
    );
}
