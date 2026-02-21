import { Truck } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/[0.06] bg-slate-950 py-8 px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1 rounded-md">
                        <Truck className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-400">
                        FleetFlow
                    </span>
                </div>
                <p className="text-[11px] text-slate-600">
                    &copy; {new Date().getFullYear()} FleetFlow. Built for modern logistics operations.
                </p>
            </div>
        </footer>
    );
}
