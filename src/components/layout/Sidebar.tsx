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
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Trips', href: '/trips', icon: Route },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Expense & Fuel', href: '/expenses', icon: Fuel },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex flex-col h-screen bg-slate-900 border-r border-slate-800 text-white z-50 shadow-xl"
        >
            {/* Logo Section */}
            <div className="flex items-center justify-between p-6 h-20">
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="full-logo"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-2"
                        >
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Truck className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                FleetFlow
                            </h1>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mini-logo"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="mx-auto bg-blue-600 p-2 rounded-lg"
                        >
                            <Truck className="h-6 w-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                'group relative flex items-center h-11 rounded-xl transition-all duration-200 outline-none',
                                isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center min-w-[56px]",
                                isActive && "text-blue-500"
                            )}>
                                <item.icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110")} />
                            </div>

                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm font-medium whitespace-nowrap"
                                >
                                    {item.name}
                                </motion.span>

                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 mt-auto border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <button
                    onClick={() => signOut()}
                    className={cn(
                        "flex items-center w-full h-11 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 overflow-hidden",
                        isCollapsed ? "justify-center" : "px-4"
                    )}
                >
                    <div className="flex items-center justify-center min-w-[24px]">
                        <LogOut className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="ml-3 text-sm font-medium"
                        >
                            Log out
                        </motion.span>
                    )}
                </button>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full border border-slate-700 shadow-lg text-white hover:bg-blue-500 transition-colors z-[60]"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
        </motion.div>
    );
}
