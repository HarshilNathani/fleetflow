'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';

export function Header() {
    const { data: session } = useSession();

    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
            <div>
                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {session?.user?.role || 'Guest'}
                </h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                    <p className="text-xs text-slate-500">{session?.user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
}
