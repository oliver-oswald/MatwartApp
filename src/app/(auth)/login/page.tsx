"use client"

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tent, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Ungültige E-Mail oder Passwort.");
                setIsLoading(false);
            } else {
                router.push('/browse');
                router.refresh();
            }
        } catch (err) {
            setError("Ein Fehler ist aufgetreten.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">

            <div className="mb-8 flex flex-col items-center">
                <div className="bg-forest-800 p-4 rounded-2xl shadow-lg mb-4 text-white">
                    <Tent size={40} />
                </div>
                <h1 className="text-3xl font-bold text-stone-800 tracking-tight">Matwart App</h1>
                <p className="text-stone-500 mt-2">Willkommen zurück!</p>
            </div>

            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-stone-100">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">E-Mail Adresse</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            className="w-full rounded-lg border-stone-200 bg-stone-50 shadow-sm focus:border-forest-500 focus:ring-forest-500 p-3 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Passwort</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full rounded-lg border-stone-200 bg-stone-50 shadow-sm focus:border-forest-500 focus:ring-forest-500 p-3 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Anmelden <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <p className="mt-8 text-stone-400 text-sm">
                Noch kein Konto?{' '}
                <Link href="/register" className="text-forest-700 font-semibold hover:underline">
                    Registrieren
                </Link>
            </p>
        </div>
    );
}