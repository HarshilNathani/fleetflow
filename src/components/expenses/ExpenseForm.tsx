'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, ExpenseFormValues } from '@/lib/validations/expense';
import { ExpenseType } from '@/types/expense';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface ExpenseFormProps {
    onSubmit: (data: any) => void;
    loading?: boolean;
}

export function ExpenseForm({ onSubmit, loading }: ExpenseFormProps) {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);

    const form = useForm<any>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            vehicleId: '',
            tripId: '',
            type: ExpenseType.FUEL,
            cost: 0,
            description: '',
            date: new Date(),
            liters: 0,
        },
    });

    const type = form.watch('type');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vDist, tDist] = await Promise.all([
                    axios.get('/api/vehicles'),
                    axios.get('/api/trips'),
                ]);
                setVehicles(vDist.data);
                setTrips(tDist.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {vehicles.map((v: any) => (
                                            <SelectItem key={v._id} value={v._id}>
                                                {v.name} ({v.licensePlate})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expense Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ExpenseType).map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tripId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Related Trip (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select trip" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {trips.map((t: any) => (
                                            <SelectItem key={t._id} value={t._id}>
                                                {t.origin} to {t.destination} ({new Date(t.createdAt).toLocaleDateString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Cost ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {type === ExpenseType.FUEL && (
                        <FormField
                            control={form.control}
                            name="liters"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fuel (Liters)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Regular oil change" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Log Expense
                    </Button>
                </div>
            </form>
        </Form>
    );
}
