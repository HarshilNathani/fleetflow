import { NextResponse } from 'next/server';
import { getDriverById, updateDriver, deleteDriver } from '@/lib/services/driver.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const driver = await getDriverById(id);
        if (!driver) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }
        return NextResponse.json(driver);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const actor = session.user?.id && session.user?.role
            ? { userId: session.user.id, role: session.user.role }
            : undefined;
        const driver = await updateDriver(id, data, actor);
        if (!driver) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }
        return NextResponse.json(driver);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const driver = await deleteDriver(id);
        if (!driver) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Driver deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
