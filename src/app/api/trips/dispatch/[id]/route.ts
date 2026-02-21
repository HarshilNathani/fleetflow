import { NextResponse } from 'next/server';
import { dispatchTrip } from '@/lib/services/trip.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const actor = session.user?.id && session.user?.role
            ? { userId: session.user.id, role: session.user.role }
            : undefined;
        const trip = await dispatchTrip(id, actor);
        return NextResponse.json(trip);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
