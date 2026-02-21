'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { ProximityCard } from './ProximityCard';

const EASE = [0.25, 0.1, 0.25, 1] as const;

const painPoints = [
    {
        icon: MapPin,
        label: 'Blind Spots',
        desc: 'Vehicles off-grid. No visibility into real-time location or status.',
    },
    {
        icon: Clock,
        label: 'Wasted Hours',
        desc: 'Manual dispatch. Spreadsheets. Phone calls. Repeated every day.',
    },
    {
        icon: AlertTriangle,
        label: 'Missed Maintenance',
        desc: 'Breakdowns that should have been prevented weeks ago.',
    },
    {
        icon: DollarSign,
        label: 'Cost Leaks',
        desc: 'Fuel waste, idle time, and expenses that compound silently.',
    },
];

export function ProblemSection() {
    return (
        <section className="relative py-32 md:py-40 px-6 bg-slate-950 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-red-500/[0.015] blur-3xl" />
            </div>

            <div className="max-w-5xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="text-center mb-20"
                >
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                        The Problem
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Fleet operations shouldn&apos;t<br />
                        <span className="text-slate-500">feel like guesswork</span>
                    </h2>
                    <p className="mt-5 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Most logistics teams still run on fragmented tools, delayed data,
                        and reactive decisions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {painPoints.map((point, i) => (
                        <motion.div
                            key={point.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{
                                duration: 0.7,
                                delay: i * 0.1,
                                ease: EASE,
                            }}
                        >
                            <ProximityCard className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                                <div className="h-9 w-9 rounded-lg bg-red-500/[0.08] border border-red-500/[0.1] flex items-center justify-center mb-4">
                                    <point.icon className="h-4 w-4 text-red-400/80" />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1.5">
                                    {point.label}
                                </h3>
                                <p className="text-[13px] text-slate-500 leading-relaxed">
                                    {point.desc}
                                </p>
                            </ProximityCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
