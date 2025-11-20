import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CategoryPage({ params }: PageProps) {
    // 1. Get slug from params (awaiting it as it is a Promise in Next.js 15)
    const { slug } = await params;

    // 2. Get category by slug
    const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', slug)
        .single();

    if (categoryError || !category) {
        console.error('Error fetching category:', categoryError);
        // If category not found or error, we can't show listings.
        // The user asked to console.error.
        // We should probably still return notFound() or show an error message on screen?
        // The user said: "Ja notiek kļūda, izvadi to console.error, lai es redzu terminālī."
        // I will keep notFound() for now if it's a missing category, but maybe just return if it's a DB error?
        // Let's follow the previous logic but add the console.error as requested.
        if (categoryError?.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
            console.error('Full category error object:', categoryError);
        }
        notFound();
    }

    // 3. Get listings by category_id
    const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*') // User asked for '*' in step 3 of their request
        .eq('category_id', category.id);

    if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return <div className="p-4 text-red-500">Error loading listings.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

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
                        No listings found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
