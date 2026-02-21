import { NextResponse } from 'next/server';
import { getAllVehicles, createVehicle } from '@/lib/services/vehicle.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') ?? undefined;
        const status = searchParams.get('status') ?? undefined;
        const vehicles = await getAllVehicles({ search, status });
        return NextResponse.json(vehicles);
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
        const vehicle = await createVehicle(data);
        return NextResponse.json(vehicle, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
