import { NextResponse } from 'next/server';
import { getDashboardKPIs } from '@/lib/services/analytics.service';

export async function GET() {
    try {
        const kpis = await getDashboardKPIs();
        return NextResponse.json(kpis);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
