'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { useDebounce } from '@/hooks/useDebounce';
import { ExpenseFormValues } from '@/lib/validations/expense';
import { toast } from 'sonner';

export default function ExpenseLogs() {
    const [expenses, setExpenses] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [vehicles, setVehicles] = useState<{ _id: string; name: string; licensePlate?: string }[]>([]);
    const [vehicleFilter, setVehicleFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const debouncedSearch = useDebounce(search, 350);

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
            if (vehicleFilter && vehicleFilter !== 'all') params.set('vehicleId', vehicleFilter);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            const response = await axios.get(`/api/expenses?${params.toString()}`);
            setExpenses(response.data);
        } catch {
            toast.error('Failed to load expenses');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, typeFilter, vehicleFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    useEffect(() => {
        axios.get('/api/vehicles').then((r) => setVehicles(r.data)).catch(() => setVehicles([]));
    }, []);

    const onSubmit = async (values: ExpenseFormValues) => {
        try {
            setSubmitting(true);
            await axios.post('/api/expenses', values);
            setOpen(false);
            toast.success('Expense logged successfully');
            fetchExpenses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error saving expense');
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

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by description..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search expenses"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {Object.values(ExpenseType).map((t) => (
                            <SelectItem key={t} value={t}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All vehicles</SelectItem>
                        {vehicles.map((v) => (
                            <SelectItem key={v._id} value={v._id}>
                                {v.name} {v.licensePlate ? `(${v.licensePlate})` : ''}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    className="w-[150px]"
                    placeholder="From"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Date from"
                />
                <Input
                    type="date"
                    className="w-[150px]"
                    placeholder="To"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="Date to"
                />
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
                            (expenses as { _id: string; date: string; vehicleId?: { name?: string }; type: string; description: string; cost: number; liters?: number }[]).map((expense) => (
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
