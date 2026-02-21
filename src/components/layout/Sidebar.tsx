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
    Fuel
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicle Registry', href: '/vehicles', icon: Truck },
    { name: 'Driver Profiles', href: '/drivers', icon: Users },
    { name: 'Trip Dispatcher', href: '/trips', icon: Route },
    { name: 'Maintenance Logs', href: '/maintenance', icon: Wrench },
    { name: 'Expense & Fuel', href: '/expenses', icon: Fuel },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 h-screen bg-slate-900 text-white">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-blue-400">FleetFlow</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            pathname === item.href
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
