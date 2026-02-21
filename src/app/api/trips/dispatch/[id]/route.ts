import { NextResponse } from 'next/server';
import { dispatchTrip } from '@/lib/services/trip.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trip = await dispatchTrip(params.id);
        return NextResponse.json(trip);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
