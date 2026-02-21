import { NextResponse } from 'next/server';
import { getVehicleAnalytics, getTopCostlyVehicles } from '@/lib/services/analytics.service';

export async function GET() {
    try {
        const [analytics, topCostly] = await Promise.all([
            getVehicleAnalytics(),
            getTopCostlyVehicles(),
        ]);
        return NextResponse.json({ ...analytics, topCostly });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
