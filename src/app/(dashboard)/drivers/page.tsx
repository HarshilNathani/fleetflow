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
import { DriverStatus } from '@/types/driver';
import { DriverForm } from '@/components/drivers/DriverForm';
import { useDebounce } from '@/hooks/useDebounce';
import { DriverFormValues } from '@/lib/validations/driver';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DriverProfiles() {
    const [drivers, setDrivers] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingDriver, setEditingDriver] = useState<{ _id: string; [key: string]: unknown } | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const debouncedSearch = useDebounce(search, 350);

    const fetchDrivers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            const response = await axios.get(`/api/drivers?${params.toString()}`);
            setDrivers(response.data);
        } catch {
            toast.error('Failed to fetch drivers');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const onSubmit = async (values: DriverFormValues) => {
        try {
            setSubmitting(true);
            if (editingDriver) {
                await axios.put(`/api/drivers/${editingDriver._id}`, values);
            } else {
                await axios.post('/api/drivers', values);
            }
            setOpen(false);
            setEditingDriver(null);
            toast.success(editingDriver ? 'Driver profile updated' : 'Driver profile added');
            fetchDrivers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error saving driver');
            console.error('Error saving driver:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const onEdit = (driver: { _id: string; [key: string]: unknown }) => {
        setEditingDriver(driver);
        setOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case DriverStatus.AVAILABLE: return 'bg-green-100 text-green-700 hover:bg-green-100';
            case DriverStatus.ON_TRIP: return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case DriverStatus.OFF_DUTY: return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
            case DriverStatus.SUSPENDED: return 'bg-red-100 text-red-700 hover:bg-red-100';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Driver Profiles</h1>
                    <p className="text-slate-500">Manage your driver personnel and vehicle permissions.</p>
                </div>
                <Dialog open={open} onOpenChange={(val: boolean) => {
                    setOpen(val);
                    if (!val) setEditingDriver(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Driver
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingDriver ? 'Edit Driver Profile' : 'Add New Driver'}</DialogTitle>
                        </DialogHeader>
                        <DriverForm
                            initialData={editingDriver}
                            onSubmit={onSubmit}
                            loading={submitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or license number..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search drivers"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {Object.values(DriverStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                                {s.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Driver Name</TableHead>
                            <TableHead>License Number</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Vehicle Types</TableHead>
                            <TableHead>Safety Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">Loading drivers...</TableCell>
                            </TableRow>
                        ) : drivers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-slate-500">No drivers found.</TableCell>
                            </TableRow>
                        ) : (
                            (drivers as { _id: string; name: string; licenseNumber: string; licenseExpiry: string; allowedVehicleTypes: string[]; safetyScore: number; status: string }[]).map((driver) => (
                                <TableRow key={driver._id}>
                                    <TableCell className="font-medium">{driver.name}</TableCell>
                                    <TableCell>{driver.licenseNumber}</TableCell>
                                    <TableCell>
                                        {new Date(driver.licenseExpiry).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {driver.allowedVehicleTypes.map((type: string) => (
                                                <Badge key={type} variant="outline" className="text-[10px] uppercase">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "font-bold",
                                            driver.safetyScore >= 90 ? "text-green-600" :
                                                driver.safetyScore >= 70 ? "text-amber-600" : "text-red-600"
                                        )}>
                                            {driver.safetyScore}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(driver.status)}>
                                            {driver.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => onEdit(driver)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
