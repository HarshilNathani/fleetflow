'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema, TripFormValues } from '@/lib/validations/trip';
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

interface TripFormProps {
    onSubmit: (data: any) => void;
    loading?: boolean;
}

export function TripForm({ onSubmit, loading }: TripFormProps) {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);

    const form = useForm<any>({
        resolver: zodResolver(tripSchema),
        defaultValues: {
            vehicleId: '',
            driverId: '',
            origin: '',
            destination: '',
            cargoWeight: 0,
            revenue: 0,
            startOdometer: 0,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vDist, dDist] = await Promise.all([
                    axios.get('/api/vehicles'),
                    axios.get('/api/drivers'),
                ]);
                // Filter for available status
                setVehicles(vDist.data.filter((v: any) => v.status === 'available'));
                setDrivers(dDist.data.filter((d: any) => d.status === 'available'));
            } catch (error) {
                console.error('Error fetching dependency data:', error);
            }
        };
        fetchData();
    }, []);

    // Update startOdometer when vehicle changes
    const vehicleId = form.watch('vehicleId');
    useEffect(() => {
        if (vehicleId) {
            const selected = vehicles.find((v: any) => v._id === vehicleId);
            if (selected) {
                form.setValue('startOdometer', (selected as any).odometer);
            }
        }
    }, [vehicleId, vehicles, form]);

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
                                                {v.name} ({v.licensePlate}) - {v.type}
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
                        name="driverId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Driver</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select driver" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {drivers.map((d: any) => (
                                            <SelectItem key={d._id} value={d._id}>
                                                {d.name} ({d.licenseNumber})
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
                        name="origin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Origin</FormLabel>
                                <FormControl>
                                    <Input placeholder="City, State" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <FormControl>
                                    <Input placeholder="City, State" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="cargoWeight"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cargo Weight (kg)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="revenue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Revenue ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="startOdometer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Odometer (km)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} readOnly className="bg-slate-50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Trip Draft
                    </Button>
                </div>
            </form>
        </Form>
    );
}
