import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActivities } from '@/lib/services/activity.service';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session?.user?.role) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get('cursor') ?? undefined;
        const since = searchParams.get('since') ?? undefined;
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '25', 10) || 25, 50);

        const result = await getActivities({
            userRole: session.user.role,
            userId: session.user.id,
            cursor,
            since,
            limit,
        });

        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
