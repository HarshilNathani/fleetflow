'use client';

import { motion } from 'framer-motion';
import { Radar, Route, Wrench, TrendingUp } from 'lucide-react';
import { ProximityCard } from './ProximityCard';

const EASE = [0.25, 0.1, 0.25, 1] as const;

const capabilities = [
    {
        icon: Radar,
        title: 'Real-Time Fleet Tracking',
        desc: 'Know where every vehicle is, what it\'s carrying, and when it arrives. Live status across your entire fleet.',
        color: 'text-blue-400',
        border: 'border-blue-500/[0.15]',
        glow: 'from-blue-500/[0.04]',
    },
    {
        icon: Route,
        title: 'Intelligent Trip Dispatch',
        desc: 'Create, assign, and dispatch trips with full cargo and route awareness. Draft to delivery in minutes.',
        color: 'text-emerald-400',
        border: 'border-emerald-500/[0.15]',
        glow: 'from-emerald-500/[0.04]',
    },
    {
        icon: Wrench,
        title: 'Predictive Maintenance',
        desc: 'Track service schedules per vehicle. Get alerts before breakdowns happen. Reduce downtime by design.',
        color: 'text-amber-400',
        border: 'border-amber-500/[0.15]',
        glow: 'from-amber-500/[0.04]',
    },
    {
        icon: TrendingUp,
        title: 'Financial Analytics',
        desc: 'Revenue, expenses, ROI per vehicle, fuel efficiency — all computed automatically. Export when ready.',
        color: 'text-purple-400',
        border: 'border-purple-500/[0.15]',
        glow: 'from-purple-500/[0.04]',
    },
];

export function ValueSection() {
    return (
        <section className="relative py-32 md:py-40 px-6 bg-slate-950 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/[0.015] blur-3xl" />
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.01] blur-3xl" />
            </div>

            <div className="max-w-5xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="text-center mb-16"
                >
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                        Platform
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Built for operations,<br />
                        <span className="text-slate-500">not presentations</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {capabilities.map((cap, i) => (
                        <motion.div
                            key={cap.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{
                                duration: 0.7,
                                delay: i * 0.1,
                                ease: EASE,
                            }}
                        >
                            <ProximityCard className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-7">
                                <div
                                    className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5"
                                >
                                    <cap.icon className={`h-5 w-5 ${cap.color}`} />
                                </div>

                                <h3 className="text-base font-semibold text-white mb-2">
                                    {cap.title}
                                </h3>
                                <p className="text-[13px] text-slate-400 leading-relaxed">
                                    {cap.desc}
                                </p>

                                <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-b ${cap.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                                />
                            </ProximityCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
