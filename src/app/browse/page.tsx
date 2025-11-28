"use client"

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { CartItem, Item } from '@/types';
import { CATEGORIES } from '@/constants';
import { Image } from '@/components/ui/next-shim';
import { Plus, X, CheckCircle, Backpack } from 'lucide-react';

export default function BrowsePage() {
    const { items, addBooking } = useStore();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Booking Form State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [userName, setUserName] = useState('');
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const filteredItems = useMemo(() => {
        return selectedCategory === 'all'
            ? items
            : items.filter(i => i.category === selectedCategory);
    }, [items, selectedCategory]);

    const addToCart = (item: Item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                if (existing.quantity >= item.availableStock) return prev;
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        setSuccessMsg(`${item.name} zum Rucksack hinzugefügt`);
        setTimeout(() => setSuccessMsg(''), 2000);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                const itemStock = items.find(stock => stock.id === itemId)?.availableStock || 0;
                return { ...i, quantity: Math.min(newQty, itemStock) };
            }
            return i;
        }));
    };

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const dailyTotal = cart.reduce((acc, item) => acc + (item.pricePerDay * item.quantity), 0);
        return dailyTotal * diffDays;
    };

    const handleSubmitBooking = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (cart.length === 0) {
            setFormError('Dein Rucksack ist leer!');
            return;
        }
        if (!userName || !startDate || !endDate) {
            setFormError('');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setFormError('Rückgabe kann nich vor der Abholung sein!');
            return;
        }

        const totalCost = calculateTotal();

        addBooking({
            userName,
            items: cart,
            startDate,
            endDate,
            totalRentalCost: totalCost
        });

        setCart([]);
        setUserName('');
        setStartDate('');
        setEndDate('');
        setIsCartOpen(false);
        setSuccessMsg('Ausleihe erfolgreich eingereicht!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Filters */}
            <div className="bg-white shadow-sm px-4 py-3 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide z-10 relative">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'all'
                            ? 'bg-forest-800 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                    Alles
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                            selectedCategory === cat.id
                                ? 'bg-forest-800 text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
                {successMsg && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-forest-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down flex items-center gap-2">
                        <CheckCircle size={20} />
                        {successMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 relative bg-stone-200">
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-forest-800 backdrop-blur-sm">
                                    CHF {item.pricePerDay}/tag
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-stone-800 leading-tight">{item.name}</h3>
                                </div>
                                <p className="text-stone-500 text-sm mb-4 flex-1">{item.description}</p>
                                <div className="flex justify-between items-center mt-auto">
                  <span className={`text-xs px-2 py-1 rounded-full ${item.availableStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.availableStock} verfügbar
                  </span>
                                    <button
                                        disabled={item.availableStock === 0}
                                        onClick={() => addToCart(item)}
                                        className="bg-forest-600 hover:bg-forest-700 disabled:bg-stone-300 text-white p-2 rounded-lg transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Cart Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="bg-forest-800 hover:bg-forest-900 text-white p-4 rounded-full shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                    <Backpack />
                    {cart.length > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
                    )}
                </button>
            </div>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                                <Backpack className="text-forest-600" />
                                Dein Rucksack
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-200 rounded-full text-stone-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-10 text-stone-400">
                                    <p>Dein Rucksack ist leer.</p>
                                    <p className="text-sm">Füge paar Materialien für dein Lager hinzu!</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white border border-stone-100 p-3 rounded-lg shadow-sm">
                                        <Image src={item.imageUrl} alt="" width={64} height={64} className="rounded object-cover bg-stone-100" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-stone-800 text-sm">{item.name}</h4>
                                            <p className="text-xs text-stone-500">CHF {item.pricePerDay} / tag</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-stone-100 text-stone-600 hover:bg-stone-200">-</button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-stone-100 text-stone-600 hover:bg-stone-200">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500 ml-2">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 border-t border-stone-100 bg-stone-50">
                                <form onSubmit={handleSubmitBooking} className="space-y-4">
                                    {formError && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                                            {formError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name der Gruppe</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full rounded-md border-stone-200 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                            placeholder="Magnus Mustermann"
                                            value={userName}
                                            onChange={e => setUserName(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Abholung</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full rounded-md border-stone-200 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Rückgabe</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full rounded-md border-stone-200 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-2 text-stone-700 font-medium">
                                        <span>Geschätzte Kosten:</span>
                                        <span className="text-xl font-bold text-forest-700">CHF {calculateTotal().toFixed(2)}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5"
                                    >
                                        Ausleihe Anfragen
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
