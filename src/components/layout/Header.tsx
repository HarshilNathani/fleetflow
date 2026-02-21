'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, Bell, Search } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
    const { data: session } = useSession();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
        }
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Menu className="h-5 w-5" />
                </Button>
                <form onSubmit={handleSearch} className="relative hidden md:block w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search"
                    />
                </form>
            </div>

            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-lg relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                </Button>
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                        <p className="text-xs text-slate-500 font-medium capitalize">{session?.user?.role?.toLowerCase()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
}
