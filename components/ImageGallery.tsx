'use client';

import { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export default function ImageGallery({ images = [], title }: ImageGalleryProps) {
    // 1. State (Stāvoklis)
    const [selectedImage, setSelectedImage] = useState<string | null>(images?.[0] || null);

    // Ja nav bilžu, rādām placeholder
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square relative overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                Nav attēla
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* 2a. Galvenā bilde (Main Image) */}
            <div className="w-full aspect-square relative overflow-hidden rounded-xl bg-gray-100 shadow-md max-w-lg mx-auto">
                <img
                    src={selectedImage || images[0]}
                    alt={title}
                    className="w-full h-full object-cover absolute inset-0"
                />
            </div>

            {/* 2b. Sīktēlu josla (Thumbnails) */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(image)}
                            className={`relative aspect-square rounded-md overflow-hidden ${selectedImage === image
                                ? 'border-2 border-black'
                                : 'border border-transparent hover:border-gray-300'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${title} - ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
