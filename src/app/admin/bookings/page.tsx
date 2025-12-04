"use client"

import React, { useState } from 'react';
import { BookingStatus, BrokenItemRecord } from '@/types';
import { CalendarCheck, PackageOpen, CheckSquare, Loader2 } from 'lucide-react';
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";
import { ReturnModal } from '@/components/admin/ReturnModal';
import { BookingRequestCard } from '@/components/admin/BookingRequestCard'; // <--- Import new component
import { Chip } from "@heroui/react";
import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
type RouterOutputs = inferRouterOutputs<AppRouter>;
type BookingWithDetails = RouterOutputs["getAllBookings"][number];

export default function Page() {
    const utils = trpc.useUtils();
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const { data: bookings, isLoading } = trpc.getAllBookings.useQuery();

    const updateStatusMutation = trpc.updateBookingStatus.useMutation({
        onMutate: (vars) => setLoadingId(vars.id),
        onSuccess: (data) => {
            toast.success(`Status: ${data.newStatus}`);
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setLoadingId(null);
        },
        onError: (err) => {
            toast.error(err.message);
            setLoadingId(null);
        }
    });

    const modifyMutation = trpc.modifyAndApproveBooking.useMutation({
        onMutate: (vars) => setLoadingId(vars.bookingId),
        onSuccess: () => {
            toast.success("Buchung angepasst und bestätigt!");
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setLoadingId(null);
        },
        onError: (err) => {
            toast.error(err.message);
            setLoadingId(null);
        }
    });

    const completeReturnMutation = trpc.completeReturn.useMutation({
        onSuccess: () => {
            toast.success("Rückgabe verarbeitet");
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setSelectedBooking(null);
        },
        onError: (err) => toast.error(err.message)
    });

    const handleUpdateStatus = (id: string, status: BookingStatus) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleModifyAndApprove = (id: string, notes: string, items: { bookingItemId: string, newQuantity: number }[]) => {
        modifyMutation.mutate({ bookingId: id, adminNotes: notes, items });
    };

    const handleConfirmReturn = (bookingId: string, brokenList: BrokenItemRecord[], totalCost: number, billNote: string) => {
        completeReturnMutation.mutate({ bookingId, brokenItems: brokenList, finalBillAmount: totalCost, adminNotes: billNote });
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    const safeBookings = bookings || [];
    const pendingBookings = safeBookings.filter(b => b.status === "WARTEN");
    const activeBookings = safeBookings.filter(b => ["AKZEPTIERT", "AKTIV"].includes(b.status));
    const completedBookings = safeBookings.filter(b => b.status === "FERTIG").slice(0, 5);

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <CalendarCheck className="text-amber-500" /> Warten auf Bestätigung
                </h3>
                <div className="grid gap-4">
                    {pendingBookings.length === 0 && (
                        <p className="text-stone-400 italic text-sm">Keine offenen Anfragen.</p>
                    )}

                    {pendingBookings.map(b => (
                        <BookingRequestCard
                            key={b.id}
                            booking={b}
                            onUpdateStatus={handleUpdateStatus}
                            onModifyAndApprove={handleModifyAndApprove}
                            isProcessing={loadingId === b.id}
                        />
                    ))}
                </div>
            </section>
            <section>
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <PackageOpen className="text-blue-500" /> Aktive Ausleihen
                </h3>
                <div className="grid gap-4">
                    {activeBookings.length === 0 && <p className="text-stone-400 italic text-sm">Keine aktiven Ausleihen.</p>}
                    {activeBookings.map(b => (
                        <div key={b.id} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-400 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-stone-800">{b.user?.name}</p>
                                    <Chip size="sm" color={b.status === "AKZEPTIERT" ? "warning" : "primary"} variant="flat">
                                        {b.status}
                                    </Chip>
                                </div>
                                <p className="text-sm text-stone-500 mt-1">Rückgabe: {new Date(b.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                {b.status === "AKZEPTIERT" && (
                                    <button onClick={() => handleUpdateStatus(b.id, "AKTIV" as BookingStatus)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Abgeholt
                                    </button>
                                )}
                                {b.status === "AKTIV" && (
                                    <button onClick={() => setSelectedBooking(b)} className="px-4 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-900">
                                        Rückgabe
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
                        <div key={b.id} className="bg-white p-3 rounded-lg border border-stone-100 flex justify-between text-sm">
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