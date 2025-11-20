import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ContactButton from '@/components/ContactButton';
import ImageGallery from '@/components/ImageGallery';
import { MapPin, Euro } from 'lucide-react';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ListingPage({ params }: PageProps) {
    const { id } = await params;

    const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !listing) {
        console.error('Error fetching listing:', error);
        notFound();
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b">
                    <ImageGallery
                        images={listing.images || (listing.image_url ? [listing.image_url] : [])}
                        title={listing.title}
                    />

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {listing.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center text-2xl font-bold text-primary text-blue-600">
                            <Euro className="w-6 h-6 mr-1" />
                            {listing.price} {listing.currency}
                        </div>

                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-2" />
                            {listing.location}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Apraksts</h2>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {listing.description || 'Nav pievienots apraksts.'}
                            </p>
                        </div>

                        <div className="pt-6 border-t">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                    <span className="block font-medium text-gray-700">ID:</span>
                                    {listing.id}
                                </div>
                                <div>
                                    <span className="block font-medium text-gray-700">Skatījumi:</span>
                                    {listing.views_count}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Action Section */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-50 p-6 rounded-lg border sticky top-4">
                            <h3 className="font-semibold text-lg mb-4">Sazināties ar pārdevēju</h3>
                            <ContactButton />
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Drošības nolūkos nekad nepārskaitiet naudu pirms preces apskates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
