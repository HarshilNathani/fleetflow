'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, ExpenseFormValues } from '@/lib/validations/expense';
import { ExpenseType } from '@/types/expense';
import { TripStatus } from '@/types/trip';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
    onSubmit: (data: any) => void;
    loading?: boolean;
}

export function ExpenseForm({ onSubmit, loading }: ExpenseFormProps) {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [loadingTrips, setLoadingTrips] = useState(false);

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

    const vehicleId = form.watch('vehicleId');
    const type = form.watch('type');
    const selectedTripId = form.watch('tripId');
    const selectedTrip = trips.find(t => t._id === selectedTripId);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('/api/vehicles');
                setVehicles(response.data);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };
        fetchVehicles();
    }, []);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!vehicleId) {
                setTrips([]);
                return;
            }

            try {
                setLoadingTrips(true);
                const response = await axios.get(`/api/trips?vehicleId=${vehicleId}`);
                setTrips(response.data);
            } catch (error) {
                console.error('Error fetching trips:', error);
            } finally {
                setLoadingTrips(false);
            }
        };

        form.setValue('tripId', '');
        fetchTrips();
    }, [vehicleId, form]);

    const handleFormSubmit = (data: any) => {
        const submissionData = {
            ...data,
            tripId: (data.tripId === 'none' || data.tripId === '') ? undefined : data.tripId
        };

        if (submissionData.tripId) {
            const selectedTrip = trips.find(t => t._id === submissionData.tripId);
            if (selectedTrip && selectedTrip.vehicleId?._id !== submissionData.vehicleId && selectedTrip.vehicleId !== submissionData.vehicleId) {
                console.error('Integrity Error: Trip does not belong to selected vehicle');
                return;
            }
        }

        onSubmit(submissionData);
    };

    const getStatusBadge = (status: TripStatus) => {
        switch (status) {
            case TripStatus.DRAFT: return <Badge variant="outline" className="ml-2 bg-slate-100 text-slate-600 border-slate-200">Draft</Badge>;
            case TripStatus.DISPATCHED: return <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-600 border-amber-200">Dispatched</Badge>;
            case TripStatus.COMPLETED: return <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">Completed</Badge>;
            case TripStatus.CANCELLED: return <Badge variant="destructive" className="ml-2">Cancelled</Badge>;
            default: return null;
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                                <FormLabel className="flex items-center gap-2">
                                    Related Trip (Optional)
                                    {loadingTrips && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!vehicleId || type !== ExpenseType.FUEL || loadingTrips}
                                >
                                    <FormControl>
                                        <SelectTrigger
                                            className={cn(
                                                "w-full flex items-center gap-2 overflow-hidden",
                                                !vehicleId && "opacity-60"
                                            )}
                                        >
                                            <SelectValue
                                                className="w-full"
                                                placeholder={
                                                    !vehicleId
                                                        ? "Select vehicle first"
                                                        : type !== ExpenseType.FUEL
                                                            ? "Only for fuel expenses"
                                                            : "Select trip"
                                                }
                                            >
                                                {selectedTrip && (
                                                    <div className="flex w-full min-w-0 items-center justify-between gap-2">
                                                        <span
                                                            className="min-w-0 flex-1 truncate"
                                                            title={`${selectedTrip.origin} → ${selectedTrip.destination}`}
                                                        >
                                                            {selectedTrip.origin} → {selectedTrip.destination}
                                                        </span>

                                                        <div className="flex-shrink-0">
                                                            {getStatusBadge(selectedTrip.status)}
                                                        </div>
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {trips.length === 0 && vehicleId && !loadingTrips && (
                                            <div className="px-2 py-4 text-center text-xs text-slate-500 italic">
                                                No trips found for this vehicle
                                            </div>
                                        )}
                                        {trips.map((t: any) => (
                                            <SelectItem key={t._id} value={t._id}>
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <div className="text-sm">
                                                        {t.origin} → {t.destination}
                                                    </div>
                                                    <div className="flex items-center text-[10px] text-slate-500">
                                                        {new Date(t.createdAt).toLocaleDateString()}
                                                        {getStatusBadge(t.status)}
                                                    </div>
                                                </div>
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
                                        value={
                                            field.value && !isNaN(new Date(field.value).getTime())
                                                ? new Date(field.value).toISOString().split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                field.onChange(null);
                                            } else {
                                                field.onChange(new Date(e.target.value));
                                            }
                                        }}
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
                                    <Input type="number" min={0} {...field} />
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
                                        <Input type="number" min={0} {...field} />
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
