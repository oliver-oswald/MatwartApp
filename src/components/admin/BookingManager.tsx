import React from 'react';
import { Booking, BookingStatus } from '@/types';
import { CalendarCheck, PackageOpen, CheckSquare } from 'lucide-react';

interface BookingManagerProps {
    bookings: Booking[];
    onUpdateStatus: (id: string, status: BookingStatus) => void;
    onProcessReturn: (booking: Booking) => void;
}

export function BookingManager({ bookings, onUpdateStatus, onProcessReturn }: BookingManagerProps) {
    const pendingBookings = bookings.filter(b => b.status === BookingStatus.WARTEN);
    const activeBookings = bookings.filter(b => [BookingStatus.AKZEPTIERT, BookingStatus.AKTIV].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === BookingStatus.FERTIG).slice(0, 5); // Last 5

    return (
        <div className="space-y-6">

            <section>
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <CalendarCheck className="text-amber-500" /> Warten auf Bestätigung
                </h3>
                <div className="grid gap-4">
                    {pendingBookings.length === 0 && (
                        <p className="text-stone-400 italic">Keine Anfragen.</p>
                    )}
                    {pendingBookings.map(b => (
                        <div key={b.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-amber-400 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-stone-800">{b.userName}</p>
                                <p className="text-sm text-stone-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                                <p className="text-xs text-stone-400 mt-1">{b.items.length} Sachen • Total: CHF {b.totalRentalCost}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onUpdateStatus(b.id, BookingStatus.ABGELEHNT)}
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                >
                                    Ablehnen
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(b.id, BookingStatus.AKZEPTIERT)}
                                    className="px-3 py-1 text-sm bg-forest-600 text-white rounded hover:bg-forest-700"
                                >
                                    Bestätigen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <PackageOpen className="text-blue-500" /> Aktive Ausleihen
                </h3>
                <div className="grid gap-4">
                    {activeBookings.length === 0 && (
                        <p className="text-stone-400 italic">Keine aktiven Ausleihen.</p>
                    )}
                    {activeBookings.map(b => (
                        <div key={b.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-400 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-stone-800">{b.userName}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${b.status === BookingStatus.AKZEPTIERT ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {b.status}
                                    </span>
                                </div>
                                <p className="text-sm text-stone-500">Zurück am: {new Date(b.endDate).toLocaleDateString()}</p>
                                <div className="flex gap-1 mt-2">
                                    {b.items.map(i => (
                                        <span key={i.id} title={i.name} className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-xs border border-stone-200 overflow-hidden">
                                            {i.imageUrl ? <img src={i.imageUrl} className="w-full h-full object-cover" /> : '⛺'}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[120px]">
                                {b.status === BookingStatus.AKZEPTIERT && (
                                    <button
                                        onClick={() => onUpdateStatus(b.id, BookingStatus.AKTIV)}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                                    >
                                        Als Abgeholt Markieren
                                    </button>
                                )}
                                {b.status === BookingStatus.AKTIV && (
                                    <button
                                        onClick={() => onProcessReturn(b)}
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

            <section className="opacity-75">
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <CheckSquare className="text-green-500" /> Vorherige Ausleihen
                </h3>
                <div className="space-y-2">
                    {completedBookings.map(b => (
                        <div key={b.id} className="bg-white p-3 rounded border border-stone-100 flex justify-between text-sm">
                            <span>{b.userName}</span>
                            <span className="font-mono font-bold text-green-700">CHF {b.finalBillAmount?.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}