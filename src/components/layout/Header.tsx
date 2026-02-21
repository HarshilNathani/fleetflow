'use client';

import { useSession } from 'next-auth/react';
import { Menu, Bell, CheckCheck, Activity } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityItem } from '@/hooks/useActivityFeed';

const TYPE_META: Record<string, { dot: string; label: string; labelColor: string }> = {
    trip_created: { dot: 'bg-slate-400', label: 'Trip', labelColor: 'text-slate-600' },
    trip_dispatched: { dot: 'bg-sky-400', label: 'Dispatch', labelColor: 'text-sky-600' },
    trip_completed: { dot: 'bg-emerald-400', label: 'Completed', labelColor: 'text-emerald-600' },
    trip_cancelled: { dot: 'bg-rose-400', label: 'Cancelled', labelColor: 'text-rose-600' },
    vehicle_status_change: { dot: 'bg-slate-400', label: 'Vehicle', labelColor: 'text-slate-600' },
    vehicle_maintenance_complete: { dot: 'bg-amber-400', label: 'Maintenance', labelColor: 'text-amber-600' },
    driver_status_change: { dot: 'bg-violet-400', label: 'Driver', labelColor: 'text-violet-600' },
    expense_fuel: { dot: 'bg-emerald-400', label: 'Fuel', labelColor: 'text-emerald-600' },
    expense_maintenance: { dot: 'bg-amber-400', label: 'Maintenance', labelColor: 'text-amber-600' },
};

function getTypeMeta(type: string) {
    return TYPE_META[type] ?? { dot: 'bg-slate-400', label: 'Operations', labelColor: 'text-slate-500' };
}

function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function groupByTime(items: ActivityItem[]): { label: string; items: ActivityItem[] }[] {
    const now = Date.now();
    const groups: { label: string; cutoff: number; items: ActivityItem[] }[] = [
        { label: 'Just now', cutoff: now - 60 * 1000, items: [] },
        { label: 'Last hour', cutoff: now - 60 * 60 * 1000, items: [] },
        { label: 'Today', cutoff: now - 24 * 60 * 60 * 1000, items: [] },
        { label: 'Earlier', cutoff: 0, items: [] },
    ];
    for (const item of items) {
        const t = new Date(item.createdAt).getTime();
        for (const g of groups) {
            if (t >= g.cutoff) {
                g.items.push(item);
                break;
            }
        }
    }
    return groups.filter((g) => g.items.length > 0).map(({ label, items: i }) => ({ label, items: i }));
}

interface LiveFeedPanelProps {
    items: ActivityItem[];
    loading: boolean;
    onMarkRead: (ids: string[]) => void;
    onView: (item: ActivityItem) => void;
}

function LiveFeedPanel({ items, loading, onMarkRead, onView }: LiveFeedPanelProps) {
    const hasUnread = items.some((i) => !i.read);
    const unreadIds = items.filter((i) => !i.read).map((i) => i.id);
    const grouped = useMemo(() => groupByTime(items), [items]);

    const handleMarkAllRead = () => {
        if (unreadIds.length > 0) onMarkRead(unreadIds);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.975 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-[23rem] rounded-xl border border-slate-200/80 bg-white/96 backdrop-blur-sm z-50 overflow-hidden"
            style={{
                boxShadow: '0 4px 24px -4px rgba(15,23,42,0.10), 0 1px 4px -1px rgba(15,23,42,0.06), 0 0 0 0.5px rgba(15,23,42,0.06)',
            }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
                        Live Operations
                    </span>
                    {unreadIds.length > 0 && (
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-1.5 py-[1px] text-[9px] font-bold text-white">
                            {unreadIds.length}
                        </span>
                    )}
                </div>
                {hasUnread && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                    </button>
                )}
            </div>

            {loading && items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                    <p className="text-[13px] text-slate-400">Loading activity...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                    <p className="text-[13px] text-slate-400">No operations yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Create trips, log expenses, or dispatch vehicles to see activity.</p>
                </div>
            ) : (
                <ul className="max-h-[380px] overflow-y-auto">
                    {grouped.map(({ label, items: groupItems }) => (
                        <li key={label} className="border-b border-slate-100/80 last:border-0">
                            <div className="px-4 py-2 bg-slate-50/60">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {label}
                                </span>
                            </div>
                            {groupItems.map((item, idx) => {
                                const meta = getTypeMeta(item.type);
                                return (
                                    <motion.li
                                        key={item.id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03, duration: 0.2 }}
                                        onClick={() => onView(item)}
                                        className={cn(
                                            'relative px-4 py-3.5 cursor-pointer transition-colors border-b border-slate-100/60 last:border-0',
                                            item.read
                                                ? 'bg-white hover:bg-slate-50/60'
                                                : 'bg-slate-50/50 hover:bg-slate-50'
                                        )}
                                    >
                                        {!item.read && (
                                            <span className="absolute left-0 top-3.5 bottom-3.5 w-[2px] rounded-r-full bg-slate-800" />
                                        )}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-[6px] shrink-0">
                                                <span className={cn('block h-[7px] w-[7px] rounded-full', meta.dot)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between gap-2 mb-[3px]">
                                                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', meta.labelColor)}>
                                                        {meta.label}
                                                    </span>
                                                    <span className="shrink-0 text-[10px] text-slate-400 tabular-nums">
                                                        {timeAgo(item.createdAt)}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    'text-[13px] leading-snug mb-0.5',
                                                    item.read ? 'text-slate-500 font-normal' : 'text-slate-800 font-medium'
                                                )}>
                                                    {item.title}
                                                </p>
                                                <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </li>
                    ))}
                </ul>
            )}

            <div
                className="flex items-center justify-between px-4 py-2 border-t border-slate-100"
                style={{ background: 'rgba(248,250,252,0.8)' }}
            >
                <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                        Live
                    </span>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums">
                    {unreadIds.length} unread
                </span>
            </div>
        </motion.div>
    );
}

export function Header() {
    const { data: session } = useSession();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelOpen, setPanelOpen] = useState(false);

    const { items, loading, markRead, refresh } = useActivityFeed(!!session?.user);

    const unreadCount = useMemo(
        () => items.filter((i) => !i.read).length,
        [items]
    );

    const panelOpenedRef = useRef(false);
    useEffect(() => {
        if (panelOpen && !panelOpenedRef.current) {
            panelOpenedRef.current = true;
            const unread = items.filter((i) => !i.read).map((i) => i.id);
            if (unread.length > 0) markRead(unread);
        }
        if (!panelOpen) panelOpenedRef.current = false;
    }, [panelOpen, items, markRead]);

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
        }
        if (panelOpen) document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [panelOpen]);

    const handleView = (item: ActivityItem) => {
        if (!item.read) markRead([item.id]);
        setPanelOpen(false);
        if (item.href) router.push(item.href);
    };

    const initials = session?.user?.name
        ?.split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? 'U';

    return (
        <header
            className="sticky top-0 z-40 flex h-[52px] items-center justify-between px-4 gap-4"
            style={{
                background: 'rgba(249,250,251,0.88)',
                backdropFilter: 'blur(12px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
                borderBottom: '1px solid rgba(15,23,42,0.07)',
                boxShadow: '0 1px 0 rgba(15,23,42,0.04), 0 2px 8px -4px rgba(15,23,42,0.06)',
            }}
        >
            <div className="flex items-center gap-2.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-900/[0.05] rounded-md transition-colors"
                >
                    <Menu className="h-[15px] w-[15px]" />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                <div className="relative" ref={panelRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Live operations"
                        onClick={() => setPanelOpen((s) => !s)}
                        className={cn(
                            'h-8 w-8 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-900/[0.05] relative transition-colors',
                            panelOpen && 'bg-slate-900/[0.06] text-slate-700'
                        )}
                    >
                        <Bell className="h-[15px] w-[15px]" />
                        {unreadCount > 0 && (
                            <span className="absolute top-[8px] right-[8px] h-[6px] w-[6px] rounded-full bg-sky-500 ring-[1.5px] ring-white" />
                        )}
                    </Button>

                    <AnimatePresence>
                        {panelOpen && (
                            <LiveFeedPanel
                                items={items}
                                loading={loading}
                                onMarkRead={markRead}
                                onView={handleView}
                            />
                        )}
                    </AnimatePresence>
                </div>

                <span className="mx-2 h-4 w-px bg-slate-900/10" />

                <div className="flex items-center gap-2.5">
                    <div className="hidden sm:block text-right">
                        <p className="text-[12px] font-semibold text-slate-800 leading-tight">
                            {session?.user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight capitalize tracking-wide">
                            {session?.user?.role?.toLowerCase()}
                        </p>
                    </div>
                    <div
                        className="h-[30px] w-[30px] rounded-[7px] bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold select-none shrink-0"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(15,23,42,0.20)' }}
                    >
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
