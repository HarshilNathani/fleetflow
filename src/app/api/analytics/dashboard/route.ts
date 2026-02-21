import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from '@/lib/services/analytics.service';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userRole = session?.user?.role;
        const userId = session?.user?.id ?? undefined;

        const data = await getDashboardData(userRole, userId);
        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
