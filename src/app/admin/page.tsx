"use client"
import React, { useState } from 'react';
import { Item, Booking, BookingStatus, BrokenItemRecord } from '@/types';
import { CATEGORIES } from '@/constants';
import { PackageOpen, CalendarCheck, AlertTriangle, CheckSquare, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminDashboard(){
    const {items, bookings, addItem, updateBookingStatus, completeReturn, deleteItem} = useStore()

    const [activeTab, setActiveTab] = useState<'bookings' | 'inventory'>('bookings');

    // Return Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [brokenCounts, setBrokenCounts] = useState<{[itemId: string]: number}>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBill, setGeneratedBill] = useState('');

    // Add Item State
    const [newItemName, setNewItemName] = useState('');
    const [newItemCat, setNewItemCat] = useState(CATEGORIES[0].id);
    const [newItemPrice, setNewItemPrice] = useState(10);
    const [newItemStock, setNewItemStock] = useState(1);
    const [newItemDesc, setNewItemDesc] = useState('');
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

    // --- Handlers ---

    const handleOpenReturnModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setBrokenCounts({});
        setGeneratedBill('');
    };

    const handleBrokenCountChange = (itemId: string, val: number) => {
        setBrokenCounts(prev => ({...prev, [itemId]: val}));
    };

    const calculateReturnTotals = () => {
        if (!selectedBooking) return { fine: 0, total: 0, brokenList: [] };

        let fine = 0;
        const brokenList: BrokenItemRecord[] = [];

        selectedBooking.items.forEach(cartItem => {
            const brokenQty = brokenCounts[cartItem.id] || 0;
            if (brokenQty > 0) {
                const cost = brokenQty * cartItem.replacementCost;
                fine += cost;
                brokenList.push({
                    itemId: cartItem.id,
                    name: cartItem.name,
                    count: brokenQty,
                    cost: cost
                });
            }
        });

        return { fine, total: selectedBooking.totalRentalCost + fine, brokenList };
    };

    const handleGenerateBill = async () => {
        if (!selectedBooking) return;
        setIsGenerating(true);
        const { fine, brokenList } = calculateReturnTotals();

        // Optimistic calculation update in UI, then generate text
        const bookingWithProjectedFinal = { ...selectedBooking, finalBillAmount: selectedBooking.totalRentalCost + fine };

        const message = "New Message";
        setGeneratedBill(message);
        setIsGenerating(false);
    };

    const handleConfirmReturn = () => {
        if (!selectedBooking) return;
        const { total, brokenList } = calculateReturnTotals();
        completeReturn(selectedBooking.id, brokenList, total, generatedBill);
        setSelectedBooking(null);
    };

    const handleGenerateDescription = async () => {
        if (!newItemName) return;
        setIsGeneratingDesc(true);
        const desc = "New description";
        setNewItemDesc(desc);
        setIsGeneratingDesc(false);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: Item = {
            id: Date.now().toString(),
            name: newItemName,
            category: newItemCat as any,
            pricePerDay: Number(newItemPrice),
            replacementCost: Number(newItemPrice) * 5, // Auto-calc rough replacement
            totalStock: Number(newItemStock),
            availableStock: Number(newItemStock),
            description: newItemDesc || 'No description provided.',
            imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`
        };
        addItem(newItem);
        // Reset
        setNewItemName('');
        setNewItemDesc('');
        setNewItemPrice(10);
    };

    return (
        <div className="flex flex-col h-full bg-stone-100">
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
                    <div className="space-y-6">
                        {/* Request Queue */}
                        <section>
                            <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                                <CalendarCheck className="text-amber-500" /> Warten auf Bestätigung
                            </h3>
                            <div className="grid gap-4">
                                {bookings.filter(b => b.status === BookingStatus.PENDING).length === 0 && (
                                    <p className="text-stone-400 italic">Keine Anfragen.</p>
                                )}
                                {bookings.filter(b => b.status === BookingStatus.PENDING).map(b => (
                                    <div key={b.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-amber-400 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-stone-800">{b.userName}</p>
                                            <p className="text-sm text-stone-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                                            <p className="text-xs text-stone-400 mt-1">{b.items.length} Sachen • Total: CHF {b.totalRentalCost}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateBookingStatus(b.id, BookingStatus.CANCELLED)}
                                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                            >
                                                Ablehnen
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(b.id, BookingStatus.APPROVED)}
                                                className="px-3 py-1 text-sm bg-forest-600 text-white rounded hover:bg-forest-700"
                                            >
                                                Bestätigen
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Active Bookings */}
                        <section>
                            <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                                <PackageOpen className="text-blue-500" /> Aktive Ausleihen
                            </h3>
                            <div className="grid gap-4">
                                {bookings.filter(b => [BookingStatus.APPROVED, BookingStatus.ACTIVE].includes(b.status)).map(b => (
                                    <div key={b.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-400 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-stone-800">{b.userName}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${b.status === BookingStatus.APPROVED ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {b.status}
                        </span>
                                            </div>
                                            <p className="text-sm text-stone-500">Zurück am: {new Date(b.endDate).toLocaleDateString()}</p>
                                            <div className="flex gap-1 mt-2">
                                                {b.items.map(i => (
                                                    <span key={i.id} title={i.name} className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-xs border border-stone-200">
                             {i.imageUrl ? <img src={i.imageUrl} className="w-full h-full object-cover rounded" /> : '⛺'}
                          </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            {b.status === BookingStatus.APPROVED && (
                                                <button
                                                    onClick={() => updateBookingStatus(b.id, BookingStatus.ACTIVE)}
                                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                                                >
                                                    Als Abgeholt Markieren
                                                </button>
                                            )}
                                            {b.status === BookingStatus.ACTIVE && (
                                                <button
                                                    onClick={() => handleOpenReturnModal(b)}
                                                    className="px-4 py-2 text-sm bg-stone-800 text-white rounded hover:bg-stone-900 text-center"
                                                >
                                                    Rückgabe Verarbeiten
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Completed History (Last 5) */}
                        <section className="opacity-75">
                            <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                                <CheckSquare className="text-green-500" /> Vorherige Ausleihen
                            </h3>
                            <div className="space-y-2">
                                {bookings.filter(b => b.status === BookingStatus.COMPLETED).slice(0, 5).map(b => (
                                    <div key={b.id} className="bg-white p-3 rounded border border-stone-100 flex justify-between text-sm">
                                        <span>{b.userName}</span>
                                        <span className="font-mono font-bold text-green-700">CHF {b.finalBillAmount?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Add Item Form */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 h-fit lg:col-span-1">
                            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                                <PlusCircle className="text-forest-600" /> Gerät Hinzufügen
                            </h3>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Item Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            required
                                            className="flex-1 rounded-md border-stone-300 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                            value={newItemName}
                                            onChange={e => setNewItemName(e.target.value)}
                                            placeholder="e.g. Mega Torch 2000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Kategorie</label>
                                        <select
                                            className="w-full rounded-md border-stone-300 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                            value={newItemCat}
                                            onChange={e => setNewItemCat(e.target.value)}
                                        >
                                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Preis Pro Tag (CHF)</label>
                                        <input
                                            type="number" min="1"
                                            className="w-full rounded-md border-stone-300 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                            value={newItemPrice}
                                            onChange={e => setNewItemPrice(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Auf Lager</label>
                                    <input
                                        type="number" min="1"
                                        className="w-full rounded-md border-stone-300 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                                        value={newItemStock}
                                        onChange={e => setNewItemStock(Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Beschreibung</label>
                                    <textarea
                                        className="w-full rounded-md border-stone-300 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border h-24"
                                        value={newItemDesc}
                                        onChange={e => setNewItemDesc(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-forest-700 text-white font-bold py-2 rounded-md hover:bg-forest-800 transition-colors"
                                >
                                    Zum Inventar himzufügen
                                </button>
                            </form>
                        </div>

                        {/* Inventory List */}
                        <div className="bg-white rounded-lg shadow-sm border border-stone-100 lg:col-span-2 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-stone-100 bg-stone-50">
                                <h3 className="font-bold text-stone-700">Aktuel auf Lager</h3>
                            </div>
                            <div className="overflow-y-auto max-h-[600px] p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-stone-50 text-stone-500 font-medium">
                                    <tr>
                                        <th className="p-3">Item</th>
                                        <th className="p-3">Kategorie</th>
                                        <th className="p-3">Im Lager</th>
                                        <th className="p-3">Preis</th>
                                        <th className="p-3">Aktion</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-stone-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.imageUrl} className="w-10 h-10 rounded object-cover bg-stone-200" />
                                                    <div>
                                                        <div className="font-medium text-stone-800">{item.name}</div>
                                                        <div className="text-xs text-stone-400 truncate max-w-[150px]">{item.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-stone-600 capitalize">{item.category}</td>
                                            <td className="p-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${item.availableStock < 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                             {item.availableStock} / {item.totalStock}
                           </span>
                                            </td>
                                            <td className="p-3 font-mono">CHF {item.pricePerDay}</td>
                                            <td className="p-3">
                                                <button onClick={() => deleteItem(item.id)} className="text-stone-400 hover:text-red-600 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Return Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-stone-100">
                            <h2 className="text-xl font-bold text-stone-800">Rückgabe Verarbeiten: {selectedBooking.userName}</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-bold text-stone-600 text-sm uppercase mb-3">Materiel Inspizieren</h4>
                                <div className="space-y-3">
                                    {selectedBooking.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-stone-50 p-3 rounded-lg border border-stone-100">
                                            <div className="flex items-center gap-3">
                                                <img src={item.imageUrl} className="w-12 h-12 rounded bg-white" />
                                                <div>
                                                    <p className="font-medium text-stone-800">{item.name}</p>
                                                    <p className="text-xs text-stone-500">Ersetzungs Kosten: CHF {item.replacementCost}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="text-xs font-bold text-stone-400 uppercase">Verloren/Kaputt:</label>
                                                <input
                                                    type="number" min="0" max={item.quantity}
                                                    className="w-16 p-1 border rounded text-center font-mono"
                                                    value={brokenCounts[item.id] || 0}
                                                    onChange={(e) => handleBrokenCountChange(item.id, parseInt(e.target.value) || 0)}
                                                />
                                                <span className="text-sm text-stone-400">/ {item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Kosten:</span>
                                    <span>CHF {selectedBooking.totalRentalCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1 text-red-600">
                                    <span>Beschädigungen:</span>
                                    <span>+ CHF {calculateReturnTotals().fine.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-stone-200 pt-2 mt-2">
                                    <span>Totale Kosten:</span>
                                    <span>CHF {calculateReturnTotals().total.toFixed(2)}</span>
                                </div>
                            </div>

                            {calculateReturnTotals().fine > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-stone-500 uppercase mb-2">Schadens Bericht</label>
                                    <textarea
                                        className="w-full p-3 border rounded-md text-sm text-stone-600 bg-stone-50 min-h-[100px]"
                                        value={generatedBill}
                                        onChange={(e) => setGeneratedBill(e.target.value)}
                                        placeholder="Reissverschluss kaputt..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-200 font-medium"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleConfirmReturn}
                                className="px-6 py-2 rounded-lg bg-forest-700 text-white font-bold hover:bg-forest-800 shadow-lg"
                            >
                                Rückgabe Absolvieren & Abrechnen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};