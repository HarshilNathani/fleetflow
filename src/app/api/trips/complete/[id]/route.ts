import { NextResponse } from 'next/server';
import { completeTrip } from '@/lib/services/trip.service';
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

        const { endOdometer } = await req.json();
        if (!endOdometer) {
            return NextResponse.json({ error: 'End odometer is required' }, { status: 400 });
        }

        const actor = session.user?.id && session.user?.role
            ? { userId: session.user.id, role: session.user.role }
            : undefined;
        const trip = await completeTrip(id, Number(endOdometer), actor);
        return NextResponse.json(trip);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
