import { useCallback, useEffect, useRef, useState } from 'react';

export interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    entityType: string;
    entityId?: string;
    href: string;
    metadata?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
}

interface ActivityFeedState {
    items: ActivityItem[];
    nextCursor: string | null;
    loading: boolean;
    error: string | null;
}

const POLL_INTERVAL_MS = 25000;

export function useActivityFeed(enabled: boolean) {
    const [state, setState] = useState<ActivityFeedState>({
        items: [],
        nextCursor: null,
        loading: true,
        error: null,
    });
    const fetchRef = useRef<Promise<unknown> | null>(null);
    const lastCursorRef = useRef<string | null>(null);
    const newestCreatedRef = useRef<string | null>(null);
    const seenIdsRef = useRef<Set<string>>(new Set());

    const fetchActivities = useCallback(async (cursor?: string, since?: string, append = false) => {
        if (fetchRef.current) return fetchRef.current;
        const params = new URLSearchParams();
        params.set('limit', '25');
        if (since) params.set('since', since);
        else if (cursor) params.set('cursor', cursor);
        const url = `/api/activity?${params.toString()}`;
        fetchRef.current = fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch activity');
                return res.json();
            })
            .then((data: { items: ActivityItem[]; nextCursor: string | null }) => {
                const newItems = data.items.filter((a) => !seenIdsRef.current.has(a.id));
                newItems.forEach((a) => seenIdsRef.current.add(a.id));
                lastCursorRef.current = data.nextCursor;
                if (data.items.length > 0) {
                    const newest = data.items[0]?.createdAt ?? data.items[data.items.length - 1]?.createdAt;
                    if (newest && (!newestCreatedRef.current || new Date(newest) > new Date(newestCreatedRef.current))) {
                        newestCreatedRef.current = newest;
                    }
                }
                setState((prev) => {
                    const merged = append
                        ? [...newItems, ...prev.items]
                        : [...newItems, ...prev.items.filter((p) => !data.items.some((d: ActivityItem) => d.id === p.id))];
                    const deduped = Array.from(
                        new Map(merged.map((m) => [m.id, m])).values()
                    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    return {
                        items: deduped.slice(0, 50),
                        nextCursor: data.nextCursor,
                        loading: false,
                        error: null,
                    };
                });
            })
            .catch((err) => {
                setState((prev) => ({ ...prev, loading: false, error: err?.message ?? 'Error' }));
            })
            .finally(() => {
                fetchRef.current = null;
            });
        return fetchRef.current;
    }, []);

    useEffect(() => {
        if (!enabled) return;
        fetchActivities();
    }, [enabled, fetchActivities]);

    useEffect(() => {
        if (!enabled) return;
        const onFocus = () => fetchActivities();
        const id = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
            fetchActivities(undefined, newestCreatedRef.current ?? undefined, true);
        }, POLL_INTERVAL_MS);
        window.addEventListener('focus', onFocus);
        return () => {
            clearInterval(id);
            window.removeEventListener('focus', onFocus);
        };
    }, [enabled, fetchActivities]);

    const markRead = useCallback(async (activityIds: string[]) => {
        if (activityIds.length === 0) return;
        try {
            await fetch('/api/activity/read', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityIds }),
            });
            setState((prev) => ({
                ...prev,
                items: prev.items.map((i) =>
                    activityIds.includes(i.id) ? { ...i, read: true } : i
                ),
            }));
        } catch {
            setState((prev) => ({
                ...prev,
                items: prev.items.map((i) =>
                    activityIds.includes(i.id) ? { ...i, read: true } : i
                ),
            }));
        }
    }, []);

    const refresh = useCallback(() => {
        seenIdsRef.current.clear();
        lastCursorRef.current = null;
        setState((prev) => ({ ...prev, loading: true }));
        fetchActivities();
    }, [fetchActivities]);

    return {
        ...state,
        markRead,
        refresh,
    };
}
