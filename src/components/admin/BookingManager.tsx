import React, { useState } from 'react';
import { BookingStatus, BrokenItemRecord, Booking } from '@/types';
import { CalendarCheck, PackageOpen, CheckSquare, Loader2 } from 'lucide-react';
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";
import { ReturnModal } from './ReturnModal';
import {AppRouter} from "@/trpc";
import {inferRouterOutputs} from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type BookingWithDetails = RouterOutputs["getAllBookings"][number];

export function BookingManager() {
    const utils = trpc.useUtils();

    const [loadingId, setLoadingId] = useState<string | null>(null);

    const { data: bookings, isLoading } = trpc.getAllBookings.useQuery();
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
    const updateStatusMutation = trpc.updateBookingStatus.useMutation({
        onMutate: (variables) => setLoadingId(variables.id),
        onSuccess: (data) => {
            toast.success(`Status aktualisiert: ${data.newStatus}`);
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setLoadingId(null);
        },
        onError: (err) => {
            toast.error(err.message || "Fehler beim Aktualisieren");
            setLoadingId(null);
        }
    });

    const completeReturnMutation = trpc.completeReturn.useMutation({
        onSuccess: () => {
            toast.success("Rückgabe erfolgreich verarbeitet");
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setSelectedBooking(null); // Close modal
        },
        onError: (err) => {
            toast.error(err.message || "Fehler bei der Rückgabe");
        }
    });

    const handleUpdateStatus = (id: string, status: BookingStatus) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleConfirmReturn = (bookingId: string, brokenList: BrokenItemRecord[], totalCost: number, billNote: string) => {
        completeReturnMutation.mutate({
            bookingId,
            brokenItems: brokenList,
            finalBillAmount: totalCost,
            adminNotes: billNote
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-stone-400" size={40} />
            </div>
        );
    }

    const safeBookings = bookings || [];

    const pendingBookings = safeBookings.filter(b => b.status === "WARTEN");
    const activeBookings = safeBookings.filter(b => ["AKZEPTIERT", "AKTIV"].includes(b.status));
    const completedBookings = safeBookings.filter(b => b.status === "FERTIG").slice(0, 5);

    return (
        <div className="space-y-6">

            {/* 1. PENDING REQUESTS */}
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
                                <p className="font-bold text-stone-800">{b.user.name || "Unbekannt"}</p>
                                <p className="text-sm text-stone-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                                <p className="text-xs text-stone-400 mt-1">{b.items.length} Sachen • Total: CHF {b.totalRentalCost}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    disabled={loadingId === b.id}
                                    onClick={() => handleUpdateStatus(b.id, "ABGELEHNT" as BookingStatus)}
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                >
                                    Ablehnen
                                </button>
                                <button
                                    disabled={loadingId === b.id}
                                    onClick={() => handleUpdateStatus(b.id, "AKZEPTIERT" as BookingStatus)}
                                    className="px-3 py-1 text-sm bg-forest-600 text-white rounded hover:bg-forest-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loadingId === b.id ? <Loader2 className="animate-spin" size={14} /> : "Bestätigen"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. ACTIVE / APPROVED BOOKINGS */}
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
                                    <p className="font-bold text-stone-800">{b.user?.name}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${b.status === "AKZEPTIERT" ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {b.status}
                                    </span>
                                </div>
                                <p className="text-sm text-stone-500">Zurück am: {new Date(b.endDate).toLocaleDateString()}</p>
                                <div className="flex gap-1 mt-2">
                                    {b.items.map(i => (
                                        <div key={i.id} title={i.item.name} className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-xs border border-stone-200 overflow-hidden relative">
                                            {/* Note: Adjust 'i.item' depending on if your Booking type nests items or flattens them */}
                                            {i.item?.imageUrl ? (
                                                <img src={i.item.imageUrl} alt={i.item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>⛺</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[140px]">
                                {b.status === "AKZEPTIERT" && (
                                    <button
                                        disabled={loadingId === b.id}
                                        onClick={() => handleUpdateStatus(b.id, "AKTIV" as BookingStatus)}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 text-center flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        {loadingId === b.id ? <Loader2 className="animate-spin" size={14} /> : "Als Abgeholt Markieren"}
                                    </button>
                                )}
                                {b.status === "AKTIV" && (
                                    <button
                                        onClick={() => setSelectedBooking(b)}
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

            {/* 3. COMPLETED HISTORY */}
            <section className="opacity-75">
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <CheckSquare className="text-green-500" /> Vorherige Ausleihen
                </h3>
                <div className="space-y-2">
                    {completedBookings.map(b => (
                        <div key={b.id} className="bg-white p-3 rounded border border-stone-100 flex justify-between text-sm">
                            <span>{b.user?.name}</span>
                            <span className="font-mono font-bold text-green-700">CHF {b.finalBillAmount?.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </section>

            {selectedBooking && (
                <ReturnModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onConfirm={handleConfirmReturn}
                />
            )}
        </div>
    );
}