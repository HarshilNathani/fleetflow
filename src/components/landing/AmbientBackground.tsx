'use client';

import { motion } from 'framer-motion';

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
            <motion.div
                className="absolute w-[900px] h-[900px] rounded-full will-change-transform"
                style={{
                    background:
                        'radial-gradient(circle, rgba(59,130,246,0.045) 0%, transparent 70%)',
                    top: '20%',
                    left: '30%',
                }}
                animate={{
                    x: ['-10%', '15%', '-5%', '10%', '-10%'],
                    y: ['-5%', '10%', '-8%', '5%', '-5%'],
                }}
                transition={{
                    duration: 30,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'loop',
                }}
            />

            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full will-change-transform"
                style={{
                    background:
                        'radial-gradient(circle, rgba(148,163,184,0.025) 0%, transparent 70%)',
                    bottom: '10%',
                    right: '20%',
                }}
                animate={{
                    x: ['5%', '-12%', '8%', '-6%', '5%'],
                    y: ['3%', '-7%', '5%', '-10%', '3%'],
                }}
                transition={{
                    duration: 36,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'loop',
                }}
            />

            <div
                className="absolute inset-0 opacity-[0.028]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px',
                }}
            />
        </div>
    );
}
