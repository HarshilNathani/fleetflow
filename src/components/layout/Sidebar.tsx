'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    ChevronLeft,
    ChevronRight,
    Bell,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from './SidebarContext';
import { UserRole } from '@/types/user';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type SidebarItem = {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    roles: UserRole[];
};

const sidebarItems: SidebarItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: [UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY, UserRole.ANALYST],
    },
    { name: 'Vehicles', href: '/vehicles', icon: Truck, roles: [UserRole.MANAGER, UserRole.DISPATCHER] },
    { name: 'Drivers', href: '/drivers', icon: Users, roles: [UserRole.MANAGER, UserRole.SAFETY] },
    { name: 'Trips', href: '/trips', icon: Route, roles: [UserRole.MANAGER, UserRole.DISPATCHER] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: [UserRole.MANAGER, UserRole.SAFETY] },
    { name: 'Expenses', href: '/expenses', icon: Fuel, roles: [UserRole.MANAGER, UserRole.ANALYST] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: [UserRole.MANAGER, UserRole.ANALYST] },
];

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    createdAt: string; // ISO
    read: boolean;
    href?: string;
    roles?: UserRole[]; // which roles should see this
    type?: string;
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const role = session?.user?.role as UserRole | undefined;

    const { isCollapsed, toggleSidebar } = useSidebar();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const unreadCount = useMemo(() => notifications.filter((n) => !n.read && (n.roles ? n.roles.includes(role as UserRole) : true)).length, [notifications, role]);

    const [notifOpen, setNotifOpen] = useState(false);

    useEffect(() => {
        const sample: NotificationItem[] = [
            {
                id: 'n1',
                title: 'Vehicle entered maintenance',
                message: 'Van-05 was moved to In Shop for scheduled service.',
                createdAt: new Date().toISOString(),
                read: false,
                href: '/maintenance',
                roles: [UserRole.MANAGER, UserRole.SAFETY],
                type: 'MAINTENANCE',
            },
            {
                id: 'n2',
                title: 'Pending cargo detected',
                message: '2 shipments awaiting assignment in North region.',
                createdAt: new Date().toISOString(),
                read: false,
                href: '/trips',
                roles: [UserRole.DISPATCHER, UserRole.MANAGER],
                type: 'OPERATIONAL',
            },
            {
                id: 'n3',
                title: 'Monthly expense report ready',
                message: 'Expense report for March is ready to download.',
                createdAt: new Date().toISOString(),
                read: true,
                href: '/analytics',
                roles: [UserRole.ANALYST, UserRole.MANAGER],
                type: 'FINANCE',
            },
        ];

        setNotifications(sample);
    }, []);

    const visibleItems = useMemo(() => {
        if (!role) return [];
        return sidebarItems.filter((item) => item.roles.includes(role));
    }, [role]);

    if (status === 'loading') {
        return (
            <div className="w-20 h-screen bg-slate-900 border-r border-slate-800" />
        );
    }

    const isActive = (href: string) => pathname?.startsWith(href);

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleViewNotification = (n: NotificationItem) => {
        markAsRead(n.id);
        setNotifOpen(false);
        if (n.href) {
            router.push(n.href);
        }
    };

    const visibleNotifications = notifications.filter((n) => !n.roles || n.roles.includes(role as UserRole));

    const timeAgo = (iso: string) => {
        const diff = (Date.now() - new Date(iso).getTime()) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex flex-col h-screen bg-slate-900 border-r border-slate-800 text-white z-50 shadow-xl"
        >
            <div className="flex items-center justify-between p-4 h-20">
                <div className="flex items-center gap-3">
                    {!isCollapsed ? (
                        <motion.div
                            key="full"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Truck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                    FleetFlow
                                </h1>
                                {role && (
                                    <div className="mt-0.5 text-xs text-slate-300">
                                        {role.toString().charAt(0) + role.toString().slice(1).toLowerCase()}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mini"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mx-auto bg-blue-600 p-2 rounded-lg"
                        >
                            <Truck className="h-6 w-6 text-white" />
                        </motion.div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            aria-label="Notifications"
                            onClick={() => setNotifOpen((s) => !s)}
                            className="relative p-2 rounded-md hover:bg-slate-800 transition-colors"
                        >
                            <Bell className="h-5 w-5 text-slate-200" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-amber-500 text-black text-[10px] font-semibold px-1.5 py-0.5">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white text-slate-900 rounded-lg shadow-lg border border-slate-200 z-50"
                                >
                                    <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                                        <div className="text-sm font-medium">Notifications</div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => markAllAsRead()}
                                                className="text-xs text-slate-500 hover:text-slate-700"
                                            >
                                                Mark all read
                                            </button>
                                            <button
                                                onClick={() => setNotifOpen(false)}
                                                className="text-xs text-slate-400 hover:text-slate-600"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>

                                    {visibleNotifications.length === 0 ? (
                                        <div className="p-4 text-sm text-slate-500">No notifications</div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {visibleNotifications.map((n) => (
                                                <li key={n.id} className={cn('p-3 hover:bg-slate-50', n.read ? 'opacity-80' : 'bg-white')}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-sm font-semibold">{n.title}</div>
                                                                <div className="text-xs text-slate-400">{timeAgo(n.createdAt)}</div>
                                                            </div>
                                                            <div className="mt-1 text-sm text-slate-600">{n.message}</div>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <Button variant="ghost" size="sm" onClick={() => handleViewNotification(n)}>
                                                                    View
                                                                </Button>
                                                                <button
                                                                    onClick={() => markAsRead(n.id)}
                                                                    className="text-xs text-slate-500 hover:text-slate-700"
                                                                >
                                                                    Mark read
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                'group relative flex items-center h-11 rounded-xl transition-all duration-200 outline-none',
                                active
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            )}
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-center min-w-[56px]',
                                    active && 'text-blue-500'
                                )}
                            >
                                <item.icon className={cn('h-5 w-5 transition-transform duration-200 group-hover:scale-110')} />
                            </div>

                            {!isCollapsed && (
                                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-medium whitespace-nowrap">
                                    {item.name}
                                </motion.span>
                            )}

                            {active && (
                                <motion.div layoutId="active-indicator" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 mt-auto border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <button
                    onClick={() => signOut()}
                    className={cn(
                        'flex items-center w-full h-11 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 overflow-hidden',
                        isCollapsed ? 'justify-center' : 'px-4'
                    )}
                >
                    <div className="flex items-center justify-center min-w-[24px]">
                        <LogOut className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 text-sm font-medium">
                            Log out
                        </motion.span>
                    )}
                </button>
            </div>

            <button
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className="absolute -right-3 top-24 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full border border-slate-700 shadow-lg text-white hover:bg-blue-500 transition-colors z-[60]"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
        </motion.div>
    );
}