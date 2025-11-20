'use client';

import { useState } from 'react';
import { createClient_browser } from '@/lib/supabase';
import { Mail } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const supabase = createClient_browser();
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Kļūda nosūtot e-pastu. Lūdzu, mēģiniet vēlreiz.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ielogoties</h1>
                    <p className="text-gray-600">Ievadiet savu e-pasta adresi, lai saņemtu ielogošanās saiti</p>
                </div>

                {!success ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                E-pasts
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jusu.epasts@piemers.lv"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Nosūta...' : 'Saņemt saiti'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <div className="text-green-600 mb-2">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Pārbaudiet savu e-pastu!</h2>
                        <p className="text-gray-700 mb-4">
                            Mēs nosūtījām ielogošanās saiti uz <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-gray-600">
                            Noklikšķiniet uz saites e-pastā, lai ielogotos savā kontā.
                        </p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-blue-600 hover:text-blue-700">
                        ← Atpakaļ uz sākumlapu
                    </a>
                </div>
            </div>
        </div>
    );
}
