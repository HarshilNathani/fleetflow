'use client';

import { useProximityRef } from '@/hooks/useMouseProximity';

export function ProximityCard({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { ref, proximity } = useProximityRef(350);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                transform: `translateY(${-proximity * 3}px) scale(${1 + proximity * 0.008})`,
                boxShadow: proximity > 0
                    ? `0 ${4 + proximity * 8}px ${12 + proximity * 20}px rgba(0,0,0,${0.1 + proximity * 0.15})`
                    : 'none',
                borderColor: `rgba(255,255,255,${0.06 + proximity * 0.06})`,
                transition: 'transform 0.35s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.35s cubic-bezier(0.25,0.1,0.25,1), border-color 0.35s cubic-bezier(0.25,0.1,0.25,1)',
                willChange: 'transform',
            }}
        >
            <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${proximity * 0.02}), transparent 70%)`,
                    transition: 'background 0.35s cubic-bezier(0.25,0.1,0.25,1)',
                }}
            />
            {children}
        </div>
    );
}
