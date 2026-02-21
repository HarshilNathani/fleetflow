'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Truck,
    Users,
    Route,
    Wrench,
    BarChart3,
    LogOut,
    Fuel,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useSidebar } from './SidebarContext';
import { UserRole } from '@/types/user';
import { useMemo } from 'react';

// ─── Nav config ───────────────────────────────────────────────────────────────

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY, UserRole.ANALYST] },
    { label: 'Vehicles', href: '/vehicles', icon: Truck, roles: [UserRole.MANAGER, UserRole.DISPATCHER] },
    { label: 'Drivers', href: '/drivers', icon: Users, roles: [UserRole.MANAGER, UserRole.SAFETY] },
    { label: 'Trips', href: '/trips', icon: Route, roles: [UserRole.MANAGER, UserRole.DISPATCHER] },
    { label: 'Maintenance', href: '/maintenance', icon: Wrench, roles: [UserRole.MANAGER, UserRole.SAFETY] },
    { label: 'Expenses', href: '/expenses', icon: Fuel, roles: [UserRole.MANAGER, UserRole.ANALYST] },
    { label: 'Analytics', href: '/analytics', icon: BarChart3, roles: [UserRole.MANAGER, UserRole.ANALYST] },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { isCollapsed } = useSidebar();
    const role = session?.user?.role as UserRole | undefined;

    const visibleItems = useMemo(
        () => (role ? NAV_ITEMS.filter((item) => item.roles.includes(role)) : []),
        [role]
    );

    if (status === 'loading') {
        return (
            <div
                className={cn('shrink-0 h-screen', isCollapsed ? 'w-[60px]' : 'w-[220px]')}
                style={{ background: 'rgb(250,251,252)', borderRight: '1px solid rgba(15,23,42,0.07)' }}
            />
        );
    }

    const isActive = (href: string) => pathname?.startsWith(href);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 60 : 220 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative flex flex-col h-screen shrink-0 overflow-hidden z-30"
            style={{
                background: 'rgb(250,251,252)',
                borderRight: '1px solid rgba(15,23,42,0.07)',
                boxShadow: '1px 0 0 rgba(15,23,42,0.03)',
            }}
        >
            {/* ── Wordmark ───────────────────────────────────────────── */}
            <div
                className="flex h-[52px] items-center shrink-0 px-3.5"
                style={{ borderBottom: '1px solid rgba(15,23,42,0.07)' }}
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Logo mark */}
                    <div
                        className="h-[28px] w-[28px] shrink-0 rounded-[7px] bg-slate-900 flex items-center justify-center"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(15,23,42,0.20)' }}
                    >
                        <Truck className="h-[14px] w-[14px] text-white" />
                    </div>

                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                        >
                            <p className="text-[13px] font-bold text-slate-900 tracking-tight whitespace-nowrap leading-none">
                                FleetFlow
                            </p>
                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none mt-1">
                                Logistics OS
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ── Nav ────────────────────────────────────────────────── */}
            <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                {/* Section label */}
                {!isCollapsed && (
                    <p className="px-4 mb-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
                        Navigation
                    </p>
                )}

                <ul className="space-y-px px-2">
                    {visibleItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={cn(
                                        'group relative flex items-center h-9 rounded-lg transition-all duration-100 outline-none',
                                        isCollapsed ? 'justify-center' : 'px-3 gap-3',
                                        active
                                            ? 'text-slate-900'
                                            : 'text-slate-500 hover:text-slate-800'
                                    )}
                                    style={active ? {
                                        background: 'rgba(15,23,42,0.06)',
                                        boxShadow: 'inset 0 0 0 0.5px rgba(15,23,42,0.08)',
                                    } : undefined}
                                >
                                    {/* Active left bar */}
                                    {active && (
                                        <motion.span
                                            layoutId="nav-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 bg-slate-900 rounded-r-full"
                                        />
                                    )}

                                    <item.icon
                                        className={cn(
                                            'h-[15px] w-[15px] shrink-0',
                                            active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                                        )}
                                    />

                                    {!isCollapsed && (
                                        <span className="text-[13px] font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div
                className="shrink-0 p-2"
                style={{ borderTop: '1px solid rgba(15,23,42,0.07)' }}
            >
                <button
                    onClick={() => signOut()}
                    title={isCollapsed ? 'Log out' : undefined}
                    className={cn(
                        'flex items-center h-9 w-full rounded-lg text-slate-400 transition-colors duration-100',
                        'hover:bg-red-50 hover:text-red-500',
                        isCollapsed ? 'justify-center' : 'px-3 gap-3'
                    )}
                >
                    <LogOut className="h-[15px] w-[15px] shrink-0" />
                    {!isCollapsed && (
                        <span className="text-[13px] font-medium">Log out</span>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}