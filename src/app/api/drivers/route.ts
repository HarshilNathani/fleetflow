import { NextResponse } from 'next/server';
import { getAllDrivers, createDriver } from '@/lib/services/driver.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') ?? undefined;
        const status = searchParams.get('status') ?? undefined;
        const drivers = await getAllDrivers({ search, status });
        return NextResponse.json(drivers);
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
        const driver = await createDriver(data);
        return NextResponse.json(driver, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
