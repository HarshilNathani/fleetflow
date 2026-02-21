import { NextResponse } from 'next/server';
import { getAllExpenses, createExpense } from '@/lib/services/expense.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') ?? undefined;
        const vehicleId = searchParams.get('vehicleId') ?? undefined;
        const type = searchParams.get('type') ?? undefined;
        const dateFrom = searchParams.get('dateFrom') ?? undefined;
        const dateTo = searchParams.get('dateTo') ?? undefined;
        const expenses = await getAllExpenses({ search, vehicleId, type, dateFrom, dateTo });
        return NextResponse.json(expenses);
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
        const expense = await createExpense(data, actor);
        return NextResponse.json(expense, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
