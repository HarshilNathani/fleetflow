'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Car, User, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
    vehicles: { _id: string; name: string; model?: string; licensePlate?: string; status?: string }[];
    drivers: { _id: string; name: string; licenseNumber?: string; status?: string }[];
    trips: { _id: string; origin: string; destination: string; status?: string }[];
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const qParam = searchParams.get('q') ?? '';
    const [query, setQuery] = useState(qParam);
    const [results, setResults] = useState<SearchResult>({ vehicles: [], drivers: [], trips: [] });
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 350);

    useEffect(() => {
        setQuery(qParam);
    }, [qParam]);

    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
            setResults({ vehicles: [], drivers: [], trips: [] });
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                setResults(res.data);
            } catch {
                setResults({ vehicles: [], drivers: [], trips: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [debouncedQuery]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const url = new URL(window.location.href);
            url.searchParams.set('q', query);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const hasResults =
        results.vehicles.length > 0 ||
        results.drivers.length > 0 ||
        results.trips.length > 0;
    const isEmpty = !loading && debouncedQuery.length >= 2 && !hasResults;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Search</h1>
                <p className="text-slate-500">Search across vehicles, drivers, and trips.</p>
            </div>

            <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search"
                    autoFocus
                />
            </div>

            {loading && (
                <p className="text-slate-500">Searching...</p>
            )}

            {isEmpty && (
                <p className="text-slate-500">No results found for &quot;{debouncedQuery}&quot;.</p>
            )}

            {hasResults && !loading && (
                <div className="space-y-8">
                    {results.vehicles.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Car className="h-4 w-4" /> Vehicles
                            </h2>
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>License Plate</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.vehicles.map((v) => (
                                            <TableRow
                                                key={v._id}
                                                className="cursor-pointer hover:bg-slate-50"
                                                onClick={() => router.push('/vehicles')}
                                            >
                                                <TableCell className="font-medium">{v.name}</TableCell>
                                                <TableCell>{v.model ?? '-'}</TableCell>
                                                <TableCell>{v.licensePlate ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{v.status ?? '-'}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {results.drivers.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" /> Drivers
                            </h2>
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>License Number</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.drivers.map((d) => (
                                            <TableRow
                                                key={d._id}
                                                className="cursor-pointer hover:bg-slate-50"
                                                onClick={() => router.push('/drivers')}
                                            >
                                                <TableCell className="font-medium">{d.name}</TableCell>
                                                <TableCell>{d.licenseNumber ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{d.status ?? '-'}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {results.trips.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Trips
                            </h2>
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Route</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.trips.map((t) => (
                                            <TableRow
                                                key={t._id}
                                                className="cursor-pointer hover:bg-slate-50"
                                                onClick={() => router.push('/trips')}
                                            >
                                                <TableCell className="font-medium">{t.origin} → {t.destination}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{t.status ?? '-'}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
