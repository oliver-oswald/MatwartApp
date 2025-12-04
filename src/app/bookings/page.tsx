"use client"

import React from 'react';
import { trpc } from "@/app/_trpc/client";
import { Loader2, AlertTriangle, Info, CalendarClock, PackageCheck } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Chip,
    Divider,
    Avatar,
    Button
} from "@heroui/react";
import { getStatusColor } from '@/lib/utils';

export default function MyBookingsPage() {
    const { data: bookings, isLoading } = trpc.getUserBookings.useQuery();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-stone-50">
                <Loader2 className="animate-spin text-forest-700" size={48} />
            </div>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-stone-50 gap-4">
                <PackageCheck size={64} className="text-stone-300" />
                <h1 className="text-xl font-bold text-stone-600">Keine Ausleihen gefunden</h1>
                <Button as="a" href="/browse" color="primary" variant="flat">
                    Material durchstöbern
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-stone-800 mb-6">Meine Ausleihen</h1>

                {bookings.map((booking) => {
                    const hasAdminNote = !!booking.adminNotes;
                    const isModified = booking.items.some(i => i.originalQuantity && i.originalQuantity !== i.quantity);

                    return (
                        <Card key={booking.id} className="w-full shadow-sm border border-stone-100">
                            {/* Header: Dates & Status */}
                            <CardHeader className="flex justify-between items-start pb-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                                        <CalendarClock size={16} />
                                        <span>
                                            {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="font-bold text-lg text-stone-800">
                                        Buchung #{booking.id.slice(0, 8)}
                                    </div>
                                </div>
                                <Chip
                                    color={getStatusColor(booking.status)}
                                    variant="flat"
                                    className="uppercase font-bold"
                                    size="sm"
                                >
                                    {booking.status}
                                </Chip>
                            </CardHeader>

                            <Divider />

                            <CardBody className="py-4 space-y-4">

                                {/* 1. Admin Note / Alert Section */}
                                {hasAdminNote && (
                                    <div className={`p-4 rounded-lg border flex gap-3 items-start ${
                                        isModified
                                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                                            : 'bg-blue-50 border-blue-200 text-blue-900'
                                    }`}>
                                        {isModified ? <AlertTriangle className="shrink-0 mt-0.5" size={20} /> : <Info className="shrink-0 mt-0.5" size={20} />}
                                        <div className="text-sm">
                                            <span className="font-bold block mb-1">
                                                {isModified ? 'Änderung durch Materialwart' : 'Notiz vom Materialwart'}:
                                            </span>
                                            &#34;{booking.adminNotes}&#34;
                                        </div>
                                    </div>
                                )}

                                {/* 2. Items List with Diffing */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {booking.items.map((bItem) => {
                                        // Detect if this specific item was changed
                                        const wasChanged = bItem.originalQuantity && bItem.originalQuantity !== bItem.quantity;

                                        return (
                                            <div
                                                key={bItem.id}
                                                className={`flex items-center gap-3 p-2 rounded-lg border ${
                                                    wasChanged ? 'bg-amber-50/50 border-amber-200' : 'bg-stone-50 border-stone-100'
                                                }`}
                                            >
                                                <Avatar
                                                    radius="sm"
                                                    size="lg"
                                                    src={bItem.item.imageUrl}
                                                    className="bg-white shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-stone-800 truncate">{bItem.item.name}</p>
                                                    <div className="text-xs text-stone-500 flex flex-wrap gap-2 items-center mt-1">
                                                        {wasChanged ? (
                                                            <>
                                                                <span className="text-red-400 line-through decoration-red-400">
                                                                    {bItem.originalQuantity}x Gewünscht
                                                                </span>
                                                                <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                                                    {bItem.quantity}x Bestätigt
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="font-medium text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded">
                                                                {bItem.quantity}x
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardBody>

                            <Divider />

                            <CardFooter className="flex justify-between items-center bg-stone-50/50">
                                <div className="text-xs text-stone-400">
                                    Erstellt am: {new Date(booking.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-stone-500 mr-2">Total:</span>
                                    <span className="text-xl font-bold text-forest-800">
                                        CHF {booking.totalRentalCost.toFixed(2)}
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}