'use client';

import { useEffect, useRef, useState } from 'react';

interface ProximityState {
    intensity: number;
    dx: number;
    dy: number;
}

export function useMouseProximity(threshold = 320): ProximityState {
    const ref = useRef<ProximityState>({ intensity: 0, dx: 0, dy: 0 });
    const [state, setState] = useState<ProximityState>({ intensity: 0, dx: 0, dy: 0 });
    const elRef = useRef<HTMLElement | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!elRef.current) return;
            const rect = elRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const intensity = Math.max(0, 1 - dist / threshold);

            if (
                Math.abs(intensity - ref.current.intensity) > 0.01 ||
                Math.abs(dx - ref.current.dx) > 2 ||
                Math.abs(dy - ref.current.dy) > 2
            ) {
                ref.current = { intensity, dx, dy };
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                    setState({ intensity, dx, dy });
                });
            }
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [threshold]);

    return { ...state, ref: elRef } as ProximityState & { ref: React.MutableRefObject<HTMLElement | null> };
}

export function useProximityRef(threshold = 320) {
    const elRef = useRef<HTMLDivElement>(null);
    const [proximity, setProximity] = useState(0);
    const rafRef = useRef<number>(0);
    const lastVal = useRef(0);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!elRef.current) return;
            const rect = elRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.sqrt(
                (e.clientX - cx) ** 2 + (e.clientY - cy) ** 2
            );
            const val = Math.max(0, 1 - dist / threshold);
            if (Math.abs(val - lastVal.current) > 0.008) {
                lastVal.current = val;
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => setProximity(val));
            }
        };

        const onLeave = () => {
            lastVal.current = 0;
            setProximity(0);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseleave', onLeave);
        return () => {
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [threshold]);

    return { ref: elRef, proximity };
}
