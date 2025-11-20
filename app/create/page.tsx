'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

export default function CreateListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category_id: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name');

            if (error) {
                console.error('Error fetching categories:', error);
            } else {
                setCategories(data || []);
            }
        }

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get current user (optional)
            const { data: { user } } = await supabase.auth.getUser();

            // Construct payload
            const payload: any = {
                title: formData.title,
                price: parseFloat(formData.price), // Ensure number
                category_id: formData.category_id, // Ensure UUID (from select value)
                location: formData.location,
                description: formData.description,
                status: 'active'
            };

            // Only add user_id if it exists
            if (user?.id) {
                payload.user_id = user.id;
            }

            // Handle image upload
            // Handle image upload
            if (imageFiles.length > 0) {
                const imageUrls: string[] = [];

                for (const file of imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error('Error uploading file:', file.name, uploadError);
                        continue; // Skip failed uploads or throw? Let's continue for now but maybe alert user?
                        // For MVP let's just log it.
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);

                    imageUrls.push(publicUrl);
                }

                payload.images = imageUrls;
                // Also set image_url to the first image for backward compatibility if needed, 
                // but user said "nevis vecajā image_url". 
                // However, keeping it might be safer for other parts of the app until fully migrated?
                // User instruction: "Savāc visus publiskos URL masīvā. Saglabā šo masīvu datubāzes kolonnā images (nevis vecajā image_url)."
                // So I will NOT set image_url.
            }

            const { data, error } = await supabase
                .from('listings')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            router.push(`/listing/${data.id}`);
        } catch (error: any) {
            console.error('Full Error:', error);
            console.error('Error Message:', error.message);
            console.error('Error Details:', error.details);
            alert(`Notika kļūda veidojot sludinājumu: ${error.message || 'Nezināma kļūda'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Jauns sludinājums</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Virsraksts</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full p-2 border rounded-lg"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Pārdodu..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Cena (€)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full p-2 border rounded-lg"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Kategorija</label>
                        <select
                            name="category_id"
                            required
                            className="w-full p-2 border rounded-lg bg-white"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Izvēlies kategoriju</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Lokācija</label>
                    <input
                        type="text"
                        name="location"
                        required
                        className="w-full p-2 border rounded-lg"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Rīga, Centrs"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Attēli (maks. 5)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => {
                            if (e.target.files) {
                                const files = Array.from(e.target.files);
                                if (files.length > 5) {
                                    alert('Maksimālais attēlu skaits ir 5');
                                    e.target.value = ''; // Reset input
                                    setImageFiles([]);
                                    return;
                                }
                                setImageFiles(files);
                            }
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Izvēlēti {imageFiles.length} faili
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Apraksts</label>
                    <textarea
                        name="description"
                        required
                        rows={5}
                        className="w-full p-2 border rounded-lg"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Detalizēts apraksts..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Saglabā...
                        </>
                    ) : (
                        'Iesniegt sludinājumu'
                    )}
                </button>
            </form>
        </div>
    );
}
