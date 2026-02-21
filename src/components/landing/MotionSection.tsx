'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
    Truck,
    Route,
    AlertTriangle,
    CheckCircle,
    Activity,
    Package,
} from 'lucide-react';

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ── Animated counter ────────────────────────────────────────────────────── */

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let frame: number;
        const start = performance.now();
        const duration = 1800;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * to));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isInView, to]);

    return (
        <span ref={ref} className="tabular-nums">
            {value}
            {suffix}
        </span>
    );
}

/* ── Activity feed item ──────────────────────────────────────────────────── */

const feedItems = [
    {
        icon: Truck,
        color: 'text-blue-400',
        dot: 'bg-blue-400',
        text: 'Truck-12 departed Mumbai',
        time: '2m ago',
    },
    {
        icon: CheckCircle,
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
        text: 'Trip #1847 completed',
        time: '8m ago',
    },
    {
        icon: AlertTriangle,
        color: 'text-amber-400',
        dot: 'bg-amber-400',
        text: 'Van-05 maintenance due',
        time: '14m ago',
    },
    {
        icon: Package,
        color: 'text-purple-400',
        dot: 'bg-purple-400',
        text: 'Cargo assigned to Van-07',
        time: '21m ago',
    },
    {
        icon: Route,
        color: 'text-sky-400',
        dot: 'bg-sky-400',
        text: 'New route optimized: Delhi → Agra',
        time: '35m ago',
    },
    {
        icon: Activity,
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
        text: 'Fleet utilization updated: 89%',
        time: '42m ago',
    },
];

/* ── Route network SVG ───────────────────────────────────────────────────── */

function RouteNetwork() {
    return (
        <svg
            viewBox="0 0 500 300"
            fill="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* City nodes */}
            {[
                { cx: 80, cy: 60, label: 'Delhi' },
                { cx: 160, cy: 180, label: 'Mumbai' },
                { cx: 320, cy: 120, label: 'Kolkata' },
                { cx: 250, cy: 240, label: 'Bangalore' },
                { cx: 420, cy: 200, label: 'Chennai' },
                { cx: 400, cy: 60, label: 'Patna' },
                { cx: 120, cy: 130, label: 'Jaipur' },
            ].map((city, i) => (
                <g key={city.label}>
                    <motion.circle
                        cx={city.cx}
                        cy={city.cy}
                        r="4"
                        fill="#3b82f6"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.5,
                            delay: 0.2 + i * 0.1,
                            ease: EASE,
                        }}
                    />
                    {/* Pulse ring */}
                    <motion.circle
                        cx={city.cx}
                        cy={city.cy}
                        r="4"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        fill="none"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: [0, 0.4, 0] }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 2.5,
                            delay: 1 + i * 0.3,
                            repeat: Infinity,
                        }}
                        style={{ scale: 3 }}
                    />
                    <text
                        x={city.cx}
                        y={city.cy - 12}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-500"
                    >
                        {city.label}
                    </text>
                </g>
            ))}

            {/* Route lines */}
            {[
                'M80,60 Q120,120 160,180',
                'M80,60 Q200,40 320,120',
                'M160,180 Q210,220 250,240',
                'M320,120 Q370,160 420,200',
                'M250,240 Q340,230 420,200',
                'M320,120 Q360,80 400,60',
                'M80,60 Q100,95 120,130',
                'M120,130 Q140,155 160,180',
            ].map((d, i) => (
                <motion.path
                    key={i}
                    d={d}
                    stroke="rgba(59,130,246,0.2)"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 1.5,
                        delay: 0.5 + i * 0.15,
                        ease: EASE,
                    }}
                />
            ))}

            {/* Animated vehicle dots */}
            {[
                'M80,60 Q120,120 160,180',
                'M320,120 Q370,160 420,200',
                'M160,180 Q210,220 250,240',
            ].map((d, i) => (
                <motion.circle
                    key={`vehicle-${i}`}
                    r="3"
                    fill="#60a5fa"
                    initial={{ offsetDistance: '0%' }}
                    whileInView={{ offsetDistance: '100%' }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 3,
                        delay: 1.5 + i * 0.8,
                        ease: 'linear',
                        repeat: Infinity,
                        repeatDelay: 2,
                    }}
                    style={{
                        offsetPath: `path('${d}')`,
                    }}
                />
            ))}
        </svg>
    );
}

/* ── Motion Section ──────────────────────────────────────────────────────── */

export function MotionSection() {
    return (
        <section className="relative py-32 md:py-40 px-6 bg-slate-950 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-sky-500/[0.015] blur-3xl" />
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
                        Operations
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        A system that never sleeps
                    </h2>
                    <p className="mt-5 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Every vehicle tracked. Every route optimized.
                        Every decision informed.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* Route network visualization */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Route className="h-4 w-4 text-blue-400" />
                                <span className="text-[13px] font-semibold text-white">
                                    Route Network
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-medium">
                                    Live
                                </span>
                            </div>
                        </div>
                        <div className="h-64 md:h-72">
                            <RouteNetwork />
                        </div>
                    </motion.div>

                    {/* Activity feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
                        className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-slate-400" />
                                <span className="text-[13px] font-semibold text-white">
                                    Activity Feed
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                                Real-time
                            </span>
                        </div>

                        <div className="space-y-1">
                            {feedItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 0.4 + i * 0.1,
                                        ease: EASE,
                                    }}
                                    className="flex items-start gap-3 py-2.5 border-b border-white/[0.03] last:border-0"
                                >
                                    <div className="mt-0.5 shrink-0">
                                        <span
                                            className={`block h-[6px] w-[6px] rounded-full ${item.dot}`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] text-slate-300 leading-snug">
                                            {item.text}
                                        </p>
                                        <span className="text-[10px] text-slate-600">
                                            {item.time}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Live metrics bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
                    className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[
                            {
                                label: 'Trips Completed',
                                value: 1847,
                                suffix: '',
                                color: 'text-blue-400',
                            },
                            {
                                label: 'Kilometers Logged',
                                value: 284,
                                suffix: 'K',
                                color: 'text-emerald-400',
                            },
                            {
                                label: 'Avg Response Time',
                                value: 12,
                                suffix: 'min',
                                color: 'text-purple-400',
                            },
                            {
                                label: 'Uptime',
                                value: 99,
                                suffix: '.9%',
                                color: 'text-amber-400',
                            },
                        ].map((metric) => (
                            <div key={metric.label} className="text-center">
                                <p
                                    className={`text-2xl md:text-3xl font-bold ${metric.color}`}
                                >
                                    <Counter
                                        to={metric.value}
                                        suffix={metric.suffix}
                                    />
                                </p>
                                <span className="text-[11px] text-slate-500 mt-1 block">
                                    {metric.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
