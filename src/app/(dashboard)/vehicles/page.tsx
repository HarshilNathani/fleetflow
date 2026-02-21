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
import { VehicleStatus } from '@/types/vehicle';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { useDebounce } from '@/hooks/useDebounce';
import { VehicleFormValues } from '@/lib/validations/vehicle';
import { toast } from 'sonner';

export default function VehicleRegistry() {
    const [vehicles, setVehicles] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<{ _id: string; [key: string]: unknown } | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const debouncedSearch = useDebounce(search, 350);

    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            const response = await axios.get(`/api/vehicles?${params.toString()}`);
            setVehicles(response.data);
        } catch {
            toast.error('Failed to fetch vehicles');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const onSubmit = async (values: VehicleFormValues) => {
        try {
            setSubmitting(true);
            if (editingVehicle) {
                await axios.put(`/api/vehicles/${editingVehicle._id}`, values);
            } else {
                await axios.post('/api/vehicles', values);
            }
            setOpen(false);
            setEditingVehicle(null);
            toast.success(editingVehicle ? 'Vehicle updated' : 'Vehicle added');
            fetchVehicles();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error saving vehicle');
            console.error('Error saving vehicle:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const onEdit = (vehicle: { _id: string; [key: string]: unknown }) => {
        setEditingVehicle(vehicle);
        setOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case VehicleStatus.AVAILABLE: return 'bg-green-100 text-green-700 hover:bg-green-100';
            case VehicleStatus.ON_TRIP: return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case VehicleStatus.IN_SHOP: return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
            case VehicleStatus.RETIRED: return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Vehicle Registry</h1>
                    <p className="text-slate-500">Manage and monitor your fleet vehicles.</p>
                </div>
                <Dialog open={open} onOpenChange={(val: boolean) => {
                    setOpen(val);
                    if (!val) setEditingVehicle(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                        </DialogHeader>
                        <VehicleForm
                            initialData={editingVehicle}
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
                        placeholder="Search by name, model, or license plate..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search vehicles"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {Object.values(VehicleStatus).map((s) => (
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
                            <TableHead>Vehicle Name</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>License Plate</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Odometer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">Loading vehicles...</TableCell>
                            </TableRow>
                        ) : vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-slate-500">No vehicles found.</TableCell>
                            </TableRow>
                        ) : (
                            (vehicles as { _id: string; name: string; model: string; licensePlate: string; type: string; maxCapacity: number; odometer: number; status: string }[]).map((vehicle) => (
                                <TableRow key={vehicle._id}>
                                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                                    <TableCell>{vehicle.model}</TableCell>
                                    <TableCell>{vehicle.licensePlate}</TableCell>
                                    <TableCell className="capitalize">{vehicle.type}</TableCell>
                                    <TableCell>{vehicle.maxCapacity} kg</TableCell>
                                    <TableCell>{vehicle.odometer} km</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(vehicle.status)}>
                                            {vehicle.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => onEdit(vehicle)}>Edit</Button>
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
