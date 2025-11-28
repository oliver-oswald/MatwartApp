import React, { useState } from 'react';
import { Booking, BrokenItemRecord } from '@/types';

interface ReturnModalProps {
    booking: Booking;
    onClose: () => void;
    onConfirm: (bookingId: string, brokenList: BrokenItemRecord[], totalCost: number, billNote: string) => void;
}

export function ReturnModal({ booking, onClose, onConfirm }: ReturnModalProps) {
    const [brokenCounts, setBrokenCounts] = useState<{ [itemId: string]: number }>({});
    const [generatedBill, setGeneratedBill] = useState('');

    const handleBrokenCountChange = (itemId: string, val: number) => {
        setBrokenCounts(prev => ({ ...prev, [itemId]: val }));
    };

    const calculateReturnTotals = () => {
        let fine = 0;
        const brokenList: BrokenItemRecord[] = [];

        booking.items.forEach(cartItem => {
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

        return { fine, total: booking.totalRentalCost + fine, brokenList };
    };

    const handleConfirm = () => {
        const { total, brokenList } = calculateReturnTotals();
        onConfirm(booking.id, brokenList, total, generatedBill);
    };

    const { fine, total } = calculateReturnTotals();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800">Rückgabe Verarbeiten: {booking.userName}</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-bold text-stone-600 text-sm uppercase mb-3">Material Inspizieren</h4>
                        <div className="space-y-3">
                            {booking.items.map(item => (
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
                            <span>CHF {booking.totalRentalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1 text-red-600">
                            <span>Beschädigungen:</span>
                            <span>+ CHF {fine.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-stone-200 pt-2 mt-2">
                            <span>Totale Kosten:</span>
                            <span>CHF {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {fine > 0 && (
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
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-200 font-medium">
                        Abbrechen
                    </button>
                    <button onClick={handleConfirm} className="px-6 py-2 rounded-lg bg-forest-700 text-white font-bold hover:bg-forest-800 shadow-lg">
                        Rückgabe Absolvieren & Abrechnen
                    </button>
                </div>
            </div>
        </div>
    );
}