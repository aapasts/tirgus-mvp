import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{
        q?: string;
    }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    // Get search query from URL params
    const { q } = await searchParams;
    const searchQuery = q || '';

    // If no query, show empty state
    if (!searchQuery.trim()) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">Meklēšana</h1>
                <div className="text-center text-gray-500 py-10">
                    Ievadiet meklēšanas vaicājumu, lai sāktu.
                </div>
            </div>
        );
    }

    // Search listings by title using ilike for case-insensitive partial match
    const { data: listings, error } = await supabase
        .from('listings')
        .select('*')
        .ilike('title', `%${searchQuery}%`);

    if (error) {
        console.error('Error searching listings:', error);
        return <div className="p-4 text-red-500">Kļūda meklējot sludinājumus.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-2">Meklēšanas rezultāti</h1>
            <p className="text-gray-600 mb-6">
                Meklēšanas vaicājums: <span className="font-semibold">&quot;{searchQuery}&quot;</span>
                {listings && ` (${listings.length} rezultāti)`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings && listings.length > 0 ? (
                    listings.map((listing) => (
                        <Link key={listing.id} href={`/listing/${listing.id}`} className="block group">
                            <div className="border rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow bg-white h-full flex flex-col">
                                <div className="w-full aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                                    {(listing.images?.[0] || listing.image_url) ? (
                                        <img
                                            src={listing.images?.[0] || listing.image_url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover absolute inset-0 hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm absolute inset-0">
                                            Nav attēla
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{listing.title}</h2>
                                <div className="flex justify-between items-center text-gray-600 mt-auto">
                                    <span className="font-bold text-lg">
                                        {listing.price} {listing.currency}
                                    </span>
                                    <span className="text-sm">{listing.location}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        Nekas netika atrasts.
                    </div>
                )}
            </div>
        </div>
    );
}
