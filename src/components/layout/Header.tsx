'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';
import { Menu, Bell, CheckCheck, Activity } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'MAINTENANCE' | 'OPERATIONAL' | 'FINANCE' | 'SYSTEM';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    href?: string;
    roles?: UserRole[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        type: 'MAINTENANCE',
        title: 'Van-05 entered maintenance',
        message: 'Moved to In Shop for scheduled service.',
        createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        read: false,
        href: '/maintenance',
        roles: [UserRole.MANAGER, UserRole.SAFETY],
    },
    {
        id: 'n2',
        type: 'OPERATIONAL',
        title: 'Pending cargo detected',
        message: '2 shipments awaiting assignment in North region.',
        createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
        read: false,
        href: '/trips',
        roles: [UserRole.DISPATCHER, UserRole.MANAGER],
    },
    {
        id: 'n3',
        type: 'FINANCE',
        title: 'Monthly expense report ready',
        message: 'March expense report is available for review.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: true,
        href: '/analytics',
        roles: [UserRole.ANALYST, UserRole.MANAGER],
    },
];

// ─── Type metadata ────────────────────────────────────────────────────────────

const TYPE_META: Record<NotificationType, { dot: string; label: string; labelColor: string }> = {
    MAINTENANCE: { dot: 'bg-amber-400', label: 'Maintenance', labelColor: 'text-amber-600' },
    OPERATIONAL: { dot: 'bg-sky-400', label: 'Operations', labelColor: 'text-sky-600' },
    FINANCE: { dot: 'bg-emerald-400', label: 'Finance', labelColor: 'text-emerald-600' },
    SYSTEM: { dot: 'bg-slate-400', label: 'System', labelColor: 'text-slate-500' },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Notification panel ───────────────────────────────────────────────────────

interface NotificationPanelProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onView: (n: Notification) => void;
}

function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onView }: NotificationPanelProps) {
    const hasUnread = notifications.some((n) => !n.read);
    const unreadCount = notifications.filter((n) => !n.read).length;

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
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
                        Live Feed
                    </span>
                    {unreadCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-1.5 py-[1px] text-[9px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {hasUnread && (
                    <button
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <CheckCheck className="h-3 w-3" />
                        Clear all
                    </button>
                )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                    <p className="text-[13px] text-slate-400">No active events</p>
                </div>
            ) : (
                <ul className="max-h-[380px] overflow-y-auto">
                    {notifications.map((n) => {
                        const meta = TYPE_META[n.type];
                        return (
                            <li
                                key={n.id}
                                onClick={() => onView(n)}
                                className={cn(
                                    'relative px-4 py-3.5 cursor-pointer transition-colors border-b border-slate-100/80 last:border-0',
                                    n.read
                                        ? 'bg-white hover:bg-slate-50/60'
                                        : 'bg-slate-50/50 hover:bg-slate-50'
                                )}
                            >
                                {/* Unread left accent */}
                                {!n.read && (
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
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            'text-[13px] leading-snug mb-0.5',
                                            n.read ? 'text-slate-500 font-normal' : 'text-slate-800 font-medium'
                                        )}>
                                            {n.title}
                                        </p>
                                        <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-1">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Status footer */}
            <div
                className="flex items-center justify-between px-4 py-2 border-t border-slate-100"
                style={{ background: 'rgba(248,250,252,0.8)' }}
            >
                <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                        System live
                    </span>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums">
                    {unreadCount} unread
                </span>
            </div>
        </motion.div>
    );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
    const { data: session } = useSession();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const role = session?.user?.role as UserRole | undefined;

    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [panelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const visibleNotifications = useMemo(
        () => notifications.filter((n) => !n.roles || (role && n.roles.includes(role))),
        [notifications, role]
    );

    const unreadCount = useMemo(
        () => visibleNotifications.filter((n) => !n.read).length,
        [visibleNotifications]
    );

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
        }
        if (panelOpen) document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [panelOpen]);

    const markRead = (id: string) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    const handleView = (n: Notification) => { markRead(n.id); setPanelOpen(false); if (n.href) router.push(n.href); };

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
            {/* ── Left ─────────────────────────────────────────────────── */}
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

            {/* ── Right ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-1">
                {/* Notification bell */}
                <div className="relative" ref={panelRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Notifications"
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
                            <NotificationPanel
                                notifications={visibleNotifications}
                                onMarkRead={markRead}
                                onMarkAllRead={markAllRead}
                                onView={handleView}
                            />
                        )}
                    </AnimatePresence>
                </div>

                <span className="mx-2 h-4 w-px bg-slate-900/10" />

                {/* User identity */}
                <div className="flex items-center gap-2.5">
                    <div className="hidden sm:block text-right">
                        <p className="text-[12px] font-semibold text-slate-800 leading-tight">
                            {session?.user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight capitalize tracking-wide">
                            {session?.user?.role?.toLowerCase()}
                        </p>
                    </div>
                    {/* Monogram avatar */}
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