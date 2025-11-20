'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient_browser } from '@/lib/supabase';
import { Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Listing {
    id: string;
    title: string;
    price: number;
    images: string[];
    created_at: string;
    user_id: string;
    status?: string;
}

export default function MyAds() {
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthAndFetchListings = async () => {
            const supabase = createClient_browser();

            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirect to login if not authenticated
                router.push('/login');
                return;
            }

            setUserId(user.id);

            // Fetch user's listings
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching listings:', error);
            } else {
                setListings(data || []);
            }

            setLoading(false);
        };

        checkAuthAndFetchListings();
    }, [router]);

    const handleDelete = async (listingId: string, listingUserId: string) => {
        // Security check: ensure the listing belongs to the logged-in user
        if (userId !== listingUserId) {
            alert('Nav atļauts dzēst šo sludinājumu!');
            return;
        }

        setDeleting(listingId);

        const supabase = createClient_browser();

        // Delete the listing
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listingId)
            .eq('user_id', userId); // Additional security check in query

        if (error) {
            console.error('Error deleting listing:', error);
            alert('Kļūda dzēšot sludinājumu!');
            setDeleting(null);
        } else {
            // Remove from local state
            setListings(listings.filter(l => l.id !== listingId));
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Ielādē...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mani sludinājumi</h1>

                {listings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600 mb-4">Jums vēl nav neviena sludinājuma.</p>
                        <Link
                            href="/create"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ievietot sludinājumu
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bilde</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Nosaukums</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Cena</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Statuss</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Darbības</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {listings.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100">
                                                    {listing.images && listing.images.length > 0 ? (
                                                        <Image
                                                            src={listing.images[0]}
                                                            alt={listing.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                            Nav
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/listing/${listing.id}`}
                                                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                                                    >
                                                        {listing.title}
                                                    </Link>
                                                    <Link
                                                        href={`/listing/${listing.id}`}
                                                        className="text-gray-400 hover:text-gray-600"
                                                        title="Skatīt"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {new Date(listing.created_at).toLocaleDateString('lv-LV')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-900 font-medium">
                                                    €{listing.price.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {listing.status || 'Aktīvs'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {deleting === listing.id ? (
                                                    // Inline confirmation buttons
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDelete(listing.id, listing.user_id)}
                                                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                        >
                                                            Apstiprināt
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleting(null)}
                                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                                                        >
                                                            Atcelt
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Normal delete button
                                                    <button
                                                        onClick={() => setDeleting(listing.id)}
                                                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                                                        title="Dzēst"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span className="text-sm">Dzēst</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
