'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { ExpenseType } from '@/types/expense';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseFormValues } from '@/lib/validations/expense';

export default function ExpenseLogs() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('/api/expenses');
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: ExpenseFormValues) => {
        try {
            setSubmitting(true);
            await axios.post('/api/expenses', values);
            setOpen(false);
            fetchExpenses();
        } catch (error) {
            console.error('Error saving expense:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Expense & Fuel Logs</h1>
                    <p className="text-slate-500">Track all costs across your fleet.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Log Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Log New Expense</DialogTitle>
                        </DialogHeader>
                        <ExpenseForm onSubmit={onSubmit} loading={submitting} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Fuel (L)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Loading logs...</TableCell>
                            </TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-slate-500">No logs found.</TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense: any) => (
                                <TableRow key={expense._id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{expense.vehicleId?.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={expense.type === ExpenseType.FUEL ? 'default' : 'secondary'}>
                                            {expense.type.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell className="font-bold text-slate-900">${expense.cost.toFixed(2)}</TableCell>
                                    <TableCell>{expense.liters ? `${expense.liters} L` : '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
