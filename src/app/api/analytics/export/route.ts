import { NextResponse } from 'next/server';
import { getAllExpenses } from '@/lib/services/expense.service';
import Papa from 'papaparse';

export async function GET() {
    try {
        const expenses = await getAllExpenses();

        const csvData = expenses.map((e: any) => ({
            Date: new Date(e.date).toLocaleDateString(),
            Vehicle: e.vehicleId?.name,
            LicensePlate: e.vehicleId?.licensePlate,
            Type: e.type,
            Cost: e.cost,
            Description: e.description,
        }));

        const csv = Papa.unparse(csvData);

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="fleet-expenses-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
