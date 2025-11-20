'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, LogIn, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient_browser } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient_browser();

        // Get initial session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSignOut = async () => {
        const supabase = createClient_browser();
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">
                    Tirgus
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="search"
                            placeholder="Meklēt sludinājumus..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {user && (
                        <Link
                            href="/my-ads"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium whitespace-nowrap"
                        >
                            <User size={20} />
                            <span className="hidden sm:inline">Mani sludinājumi</span>
                        </Link>
                    )}
                    <Link
                        href="/create"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                    >
                        <PlusCircle size={20} />
                        <span className="hidden sm:inline">Ievietot sludinājumu</span>
                        <span className="sm:hidden">Ievietot</span>
                    </Link>

                    {/* Auth Section */}
                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
                                        <User size={16} />
                                        <span className="max-w-[150px] truncate">{user.email}</span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Iziet"
                                    >
                                        <LogOut size={18} />
                                        <span className="hidden sm:inline text-sm">Iziet</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <LogIn size={18} />
                                    <span className="hidden sm:inline text-sm">Ielogoties</span>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
