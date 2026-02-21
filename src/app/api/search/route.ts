import { NextResponse } from 'next/server';
import { getAllVehicles } from '@/lib/services/vehicle.service';
import { getAllDrivers } from '@/lib/services/driver.service';
import { getAllTrips } from '@/lib/services/trip.service';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q')?.trim();
        if (!q || q.length < 2) {
            return NextResponse.json({ vehicles: [], drivers: [], trips: [] });
        }

        const [vehicles, drivers, trips] = await Promise.all([
            getAllVehicles({ search: q }).then((v) => v.slice(0, 5)),
            getAllDrivers({ search: q }).then((d) => d.slice(0, 5)),
            getAllTrips({ search: q }).then((t) => t.slice(0, 5)),
        ]);

        return NextResponse.json({ vehicles, drivers, trips });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
