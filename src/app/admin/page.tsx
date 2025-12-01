"use client"

import React, { useState } from 'react';
import { BookingManager } from '@/components/admin/BookingManager';
import { InventoryManager } from '@/components/admin/InventoryManager';

export default function AdminDashboard() {

    const [activeTab, setActiveTab] = useState<'bookings' | 'inventory'>('bookings');

    return (
        <div className="flex flex-col h-full bg-stone-100">
            {/* Header / Tabs */}
            <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4">
                <h2 className="text-xl font-bold text-stone-800">Admin Console</h2>
                <div className="flex bg-stone-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'bookings' ? 'bg-white text-forest-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                        Ausleihen
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'inventory' ? 'bg-white text-forest-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                        Inventar
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

                {activeTab === 'bookings' && (
                    <BookingManager />
                )}

                {activeTab === 'inventory' && (
                    <InventoryManager />
                )}
            </div>
        </div>
    );
}