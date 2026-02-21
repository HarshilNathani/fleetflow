'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Play, CheckCircle, Loader2 } from 'lucide-react';
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
import { TripStatus } from '@/types/trip';
import { TripForm } from '@/components/trips/TripForm';
import { useDebounce } from '@/hooks/useDebounce';
import { TripFormValues } from '@/lib/validations/trip';
import { toast } from 'sonner';

export default function TripDispatcher() {
    const [trips, setTrips] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [odoOpen, setOdoOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<{ _id: string; startOdometer?: number } | null>(null);
    const [endOdo, setEndOdo] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [vehicles, setVehicles] = useState<{ _id: string; name: string; licensePlate?: string }[]>([]);
    const [drivers, setDrivers] = useState<{ _id: string; name: string }[]>([]);
    const [vehicleFilter, setVehicleFilter] = useState<string>('all');
    const [driverFilter, setDriverFilter] = useState<string>('all');

    const debouncedSearch = useDebounce(search, 350);

    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            if (vehicleFilter && vehicleFilter !== 'all') params.set('vehicleId', vehicleFilter);
            if (driverFilter && driverFilter !== 'all') params.set('driverId', driverFilter);
            const response = await axios.get(`/api/trips?${params.toString()}`);
            setTrips(response.data);
        } catch {
            toast.error('Failed to fetch trips');
            setTrips([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter, vehicleFilter, driverFilter]);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    useEffect(() => {
        axios.get('/api/vehicles').then((r) => setVehicles(r.data)).catch(() => setVehicles([]));
        axios.get('/api/drivers').then((r) => setDrivers(r.data)).catch(() => setDrivers([]));
    }, []);

    const onSubmit = async (values: TripFormValues) => {
        try {
            setSubmitting(true);
            await axios.post('/api/trips', values);
            setOpen(false);
            toast.success('Trip created successfully');
            fetchTrips();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error creating trip');
        } finally {
            setSubmitting(false);
        }
    };

    const onDispatch = async (id: string) => {
        try {
            await axios.post(`/api/trips/dispatch/${id}`);
            toast.success('Trip dispatched');
            fetchTrips();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error dispatching trip');
        }
    };

    const onComplete = async () => {
        if (!selectedTrip) return;
        try {
            setSubmitting(true);
            await axios.post(`/api/trips/complete/${selectedTrip._id}`, { endOdometer: endOdo });
            setOdoOpen(false);
            setSelectedTrip(null);
            setEndOdo('');
            toast.success('Trip completed');
            fetchTrips();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error completing trip');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case TripStatus.DRAFT: return 'bg-slate-100 text-slate-700';
            case TripStatus.DISPATCHED: return 'bg-blue-100 text-blue-700';
            case TripStatus.COMPLETED: return 'bg-green-100 text-green-700';
            case TripStatus.CANCELLED: return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Trip Dispatcher</h1>
                    <p className="text-slate-500">Plan and manage vehicle deployments.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Create Trip
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Create New Trip Draft</DialogTitle>
                        </DialogHeader>
                        <TripForm onSubmit={onSubmit} loading={submitting} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by route (origin or destination)..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search trips"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {Object.values(TripStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
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
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Driver" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All drivers</SelectItem>
                        {drivers.map((d) => (
                            <SelectItem key={d._id} value={d._id}>
                                {d.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Loading trips...</TableCell>
                            </TableRow>
                        ) : trips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-slate-500">No trips found.</TableCell>
                            </TableRow>
                        ) : (
                            (trips as { _id: string; status: string; origin: string; destination: string; cargoWeight: number; vehicleId?: { name?: string; licensePlate?: string }; driverId?: { name?: string } }[]).map((trip) => (
                                <TableRow key={trip._id}>
                                    <TableCell className="font-medium">
                                        {trip.vehicleId?.name} <span className="text-xs text-slate-500">({trip.vehicleId?.licensePlate})</span>
                                    </TableCell>
                                    <TableCell>{trip.driverId?.name}</TableCell>
                                    <TableCell>{trip.origin} → {trip.destination}</TableCell>
                                    <TableCell>{trip.cargoWeight} kg</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(trip.status)}>
                                            {trip.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {trip.status === TripStatus.DRAFT && (
                                                <Button size="sm" variant="outline" onClick={() => onDispatch(trip._id)}>
                                                    <Play className="mr-2 h-3 w-3" /> Dispatch
                                                </Button>
                                            )}
                                            {trip.status === TripStatus.DISPATCHED && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                                                    setSelectedTrip(trip);
                                                    setOdoOpen(true);
                                                }}>
                                                    <CheckCircle className="mr-2 h-3 w-3" /> Complete
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={odoOpen} onOpenChange={setOdoOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Trip</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Odometer Reading (Start: {selectedTrip?.startOdometer} km)</label>
                            <Input
                                type="number"
                                value={endOdo}
                                onChange={(e) => setEndOdo(e.target.value)}
                                placeholder="Enter final odometer reading"
                            />
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onComplete} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mark as Completed
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
