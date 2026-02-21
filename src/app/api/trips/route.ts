import { NextResponse } from 'next/server';
import { getAllTrips, createTrip } from '@/lib/services/trip.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const vehicleId = searchParams.get('vehicleId') ?? undefined;
        const driverId = searchParams.get('driverId') ?? undefined;
        const status = searchParams.get('status') ?? undefined;
        const search = searchParams.get('search') ?? undefined;
        const trips = await getAllTrips({ vehicleId, driverId, status, search });
        return NextResponse.json(trips);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const actor = session.user?.id && session.user?.role
            ? { userId: session.user.id, role: session.user.role }
            : undefined;
        const trip = await createTrip(data, actor);
        return NextResponse.json(trip, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
