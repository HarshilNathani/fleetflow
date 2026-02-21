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
        return <div className={cn('h-screen', isCollapsed ? 'w-[80px]' : 'w-[260px]')} />;
    }

    const isActive = (href: string) => pathname?.startsWith(href);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col h-screen bg-slate-900 border-r border-slate-800 text-white shadow-xl"
        >
            <div className="flex items-center h-20 px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                        <Truck className="h-5 w-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            FleetFlow
                        </h1>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group relative flex items-center h-11 rounded-xl transition-all duration-200',
                                isCollapsed ? 'justify-center' : 'px-4 gap-3',
                                active
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_18px_-6px_rgba(59,130,246,0.45)]'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                                    active && 'text-blue-400'
                                )}
                            />

                            {!isCollapsed && (
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}

                            {active && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={() => signOut()}
                    className={cn(
                        'flex items-center w-full h-11 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all',
                        isCollapsed ? 'justify-center' : 'px-4 gap-3'
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
                </button>
            </div>
        </motion.aside>
    );
}