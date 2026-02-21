'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function CTASection() {
    return (
        <section className="relative py-32 md:py-44 px-6 bg-[#030712] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-3xl" />
            </div>

            {/* Dot grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.9, ease: EASE }}
                >
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-8">
                        <Truck className="h-5 w-5 text-blue-400" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Take command of your fleet
                    </h2>

                    <p className="mt-5 text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Stop reacting. Start operating. FleetFlow gives your team
                        the visibility and control to move with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors gap-2"
                        >
                            Get Started
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
