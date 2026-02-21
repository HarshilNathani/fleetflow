'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { driverSchema, DriverFormValues } from '@/lib/validations/driver';
import { DriverStatus } from '@/types/driver';
import { VehicleType } from '@/types/vehicle';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface DriverFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    loading?: boolean;
}

export function DriverForm({ initialData, onSubmit, loading }: DriverFormProps) {
    const form = useForm<any>({
        resolver: zodResolver(driverSchema),
        defaultValues: initialData ? {
            ...initialData,
            licenseExpiry: new Date(initialData.licenseExpiry),
        } : {
            name: '',
            licenseNumber: '',
            licenseExpiry: new Date(),
            allowedVehicleTypes: [],
            status: DriverStatus.AVAILABLE,
            safetyScore: 100,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>License Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="LC-987654" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="licenseExpiry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>License Expiry</FormLabel>
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
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(DriverStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <FormLabel>Allowed Vehicle Types</FormLabel>
                    <div className="flex flex-wrap gap-4 pt-2">
                        {Object.values(VehicleType).map((type) => (
                            <FormField
                                key={type}
                                control={form.control}
                                name="allowedVehicleTypes"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(type)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, type])
                                                        : field.onChange(field.value?.filter((value: any) => value !== type));
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal capitalize cursor-pointer">
                                            {type}
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    <FormMessage />
                </div>

                <FormField
                    control={form.control}
                    name="safetyScore"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Safety Score (0-100)</FormLabel>
                            <FormControl>
                                <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Profile' : 'Create Profile'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
