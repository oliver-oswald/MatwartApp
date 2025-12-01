"use client"

import React, { useState, useMemo } from 'react';
import { CartItem, Item } from '@/types';
import {Backpack, Ghost, Loader2} from 'lucide-react';
import { CategoryFilter } from '@/components/browse/CategoryFilter';
import { ItemCard } from '@/components/browse/ItemCard';
import { CartDrawer } from '@/components/browse/CartDrawer';
import {toast} from "react-hot-toast";
import {trpc} from "@/app/_trpc/client";

export default function BrowsePage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { data: items, isLoading } = trpc.getAllItems.useQuery()

    const filteredItems = useMemo(() => {
        console.log(items)
        if (!items) return []
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

        toast.success(`${item.name} zum Rucksack hinzugefügt`);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                const itemStock = items?.find(stock => stock.id === itemId)?.availableStock ?? 0;
                return { ...i, quantity: Math.min(newQty, itemStock) };
            }
            return i;
        }));
    };

    if (isLoading) {
        return (
            <div className="w-full mt-16 flex items-center flex-col h-full">
                <Loader2 className="animate-spin" size={20}/>
            </div>
        );
    }

    if (items?.length === 0) {
        return (
            <div className="mt-16 flex flex-col items-center gap-2 h-full">
                <Ghost className="h-8 w-8 text-zinc-800" />
                <h3 className="font-semibold text-xl">Ziemlich leer hier</h3>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                    {filteredItems.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            </div>

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

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onSubmit={() => setCart([])}
                cart={cart}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
            />
        </div>
    );
}