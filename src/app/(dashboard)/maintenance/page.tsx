'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { VehicleStatus } from '@/types/vehicle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MaintenanceLogs() {
    const [vehiclesInShop, setVehiclesInShop] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await axios.get(`/api/vehicles?status=${VehicleStatus.IN_SHOP}`);
            setVehiclesInShop(response.data);
        } catch {
            toast.error('Failed to load vehicles');
            setVehiclesInShop([]);
        } finally {
            setLoading(false);
        }
    };

    const onComplete = async (vehicleId: string) => {
        try {
            await axios.post(`/api/maintenance/complete/${vehicleId}`);
            toast.success('Maintenance completed successfully');
            fetchVehicles();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error completing maintenance');
            console.error('Error completing maintenance:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Maintenance Logs</h1>
                    <p className="text-slate-500">Monitor vehicles currently in-shop and maintenance history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-amber-800 text-sm flex items-center">
                            <Clock className="mr-2 h-4 w-4" /> Currently In Shop
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-amber-900">{vehiclesInShop.length}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 flex items-center">
                        <Wrench className="mr-2 h-4 w-4" /> Active Maintenance
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>License Plate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">Loading maintenance data...</TableCell>
                            </TableRow>
                        ) : vehiclesInShop.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-500">No vehicles currently in maintenance.</TableCell>
                            </TableRow>
                        ) : (
                            vehiclesInShop.map((vehicle: any) => (
                                <TableRow key={vehicle._id}>
                                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                                    <TableCell>{vehicle.model}</TableCell>
                                    <TableCell>{vehicle.licensePlate}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                            IN SHOP
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => onComplete(vehicle._id)}
                                        >
                                            <CheckCircle className="mr-2 h-3 w-3" /> Mark Complete
                                        </Button>
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
