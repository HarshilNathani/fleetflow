'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function CinematicDivider() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const gridOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 0.9], [0, 0.12, 0.12, 0]);
    const scale = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [1, 1.02, 1]);
    const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);

    return (
        <div ref={ref} className="relative h-40 md:h-56 overflow-hidden bg-slate-950">
            <motion.div
                className="absolute inset-0"
                style={{
                    scale,
                    backgroundImage:
                        'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    opacity: gridOpacity,
                }}
            />

            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: glowOpacity }}
            >
                <div className="w-[500px] h-[200px] rounded-full bg-blue-500/[0.04] blur-3xl" />
            </motion.div>

            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
        </div>
    );
}
