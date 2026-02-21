'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LandingNav() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
                'fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 md:px-10 transition-all duration-500',
                scrolled
                    ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]'
                    : 'bg-transparent'
            )}
        >
            <Link href="/" className="flex items-center gap-2.5">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Truck className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">FleetFlow</span>
            </Link>

            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Log in
                </Link>
                <Link
                    href="/register"
                    className="inline-flex items-center h-8 px-4 text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                    Get Started
                </Link>
            </div>
        </motion.header>
    );
}
