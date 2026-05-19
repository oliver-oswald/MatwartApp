"use client"

import React, { useState } from 'react';
import { BookingStatus, BrokenItemRecord } from '@/types';
import {CalendarCheck, PackageOpen, CheckSquare, Loader2, AlertTriangle, Image as ImageIcon, Clock, Plus, Minus, Trash2} from 'lucide-react';
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";
import { CheckoutFullscreenModal } from '@/components/admin/checkout/CheckoutFullscreenModal';
import { BookingRequestCard } from '@/components/admin/BookingRequestCard';
import { Accordion, AccordionItem, Avatar, Button, Chip, Link, Modal, ModalContent, useDisclosure } from "@heroui/react";
import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
import { getOverbookedItems } from '@/lib/utils';

// Ensure your types are picking up the new 'damageReports' include from the backend
type RouterOutputs = inferRouterOutputs<AppRouter>;
type BookingWithDetails = RouterOutputs["getAllBookings"][number];

export default function Page() {
    const utils = trpc.useUtils();
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [activeBookingForAddItem, setActiveBookingForAddItem] = useState<string | null>(null);
    const [selectedItemToAdd, setSelectedItemToAdd] = useState<string>("");
    const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    
    const confirmSlotMutation = trpc.confirmPickupSlot.useMutation({
        onSuccess: () => {
            toast.success("Termin bestätigt!");
            utils.getAllBookings.invalidate();
        }
    });
    
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

    const modifyBookingItemsMutation = trpc.modifyBookingItems.useMutation({
        onMutate: (vars) => setLoadingId(vars.bookingId),
        onSuccess: () => {
            toast.success("Buchungspositionen aktualisiert!");
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setLoadingId(null);
        },
        onError: (err) => {
            toast.error(err.message);
            setLoadingId(null);
        }
    });

    const addItemToBookingMutation = trpc.addItemToBooking.useMutation({
        onMutate: (vars) => setLoadingId(vars.bookingId),
        onSuccess: () => {
            toast.success("Gerät zur Buchung hinzugefügt!");
            utils.getAllBookings.invalidate();
            utils.getAllItems.invalidate();
            setLoadingId(null);
            setSelectedItemToAdd("");
            setNewItemQuantity(1);
            setActiveBookingForAddItem(null);
            onOpenChange();
        },
        onError: (err) => {
            toast.error(err.message);
            setLoadingId(null);
        }
    });
    
    const { data: allItems, isLoading: isLoadingAllItems } = trpc.getAllItems.useQuery();
    
    const handleUpdateStatus = (id: string, status: BookingStatus) => {
        updateStatusMutation.mutate({ id, status });
    };
    
    const handleModifyAndApprove = (id: string, notes: string, items: { bookingItemId: string, newQuantity: number }[]) => {
        modifyMutation.mutate({ bookingId: id, adminNotes: notes, items });
    };
    
    const handleConfirmReturn = (bookingId: string, brokenList: BrokenItemRecord[], totalCost: number, billNote: string) => {
        completeReturnMutation.mutate({ bookingId, brokenItems: brokenList, finalBillAmount: totalCost, adminNotes: billNote });
    };

    const handleModifyBookingItems = (bookingId: string, items: { bookingItemId: string, newQuantity: number }[]) => {
        modifyBookingItemsMutation.mutate({ bookingId, items });
    };

    const handleAddItemToBooking = () => {
        if (!activeBookingForAddItem || !selectedItemToAdd) return;

        addItemToBookingMutation.mutate({
            bookingId: activeBookingForAddItem,
            itemId: selectedItemToAdd,
            quantity: newItemQuantity
        });
    };

    const handleAddItemModalToggle = () => {
        if (isOpen) {
            setActiveBookingForAddItem(null);
            setSelectedItemToAdd("");
            setNewItemQuantity(1);
        }
        onOpenChange();
    };
    
    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    
    const safeBookings = bookings?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    const pendingBookings = safeBookings.filter(b => b.status === "WARTEN");
    const activeBookings = safeBookings.filter(b => ["AKZEPTIERT", "AKTIV"].includes(b.status));
    const completedBookings = safeBookings.filter(b => b.status === "FERTIG").slice(0, 5);
    
    const { items: overbookedItems } = getOverbookedItems(pendingBookings);
    return (
        <div className="space-y-8">
            {/* PENDING */}
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
                            overbookedItems={overbookedItems}
                        />
                    ))}
                </div>
            </section>

            {/* ACTIVE */}
            <section>
                <h3 className="text-lg font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <PackageOpen className="text-blue-500" /> Aktive Ausleihen
                </h3>
                <div className="grid gap-4">
                    {activeBookings.length === 0 && <p className="text-stone-400 italic text-sm">Keine aktiven Ausleihen.</p>}
                    {activeBookings.map(b => {

                        const hasAnyDamage = b.items.some(i => i.damageReports && i.damageReports.length > 0);

                        const pickupSlots = b.pickupSlots || [];
                        const hasProposals = pickupSlots.length > 0;
                        const confirmedSlot = pickupSlots.find((s) => s.isConfirmed);

                        return (
                            <div key={b.id} className={`bg-white rounded-lg shadow-sm border ${hasAnyDamage ? 'border-l-4 border-l-red-500 border-red-200' : 'border-l-4 border-l-blue-400 border-stone-100'} overflow-hidden`}>
                                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-stone-800">{b.user?.name}</p>
                                            <Chip size="sm" color={b.status === "AKZEPTIERT" ? "warning" : "primary"} variant="flat">
                                                {b.status}
                                            </Chip>
                                            {hasAnyDamage && (
                                                <Chip size="sm" color="danger" variant="solid" startContent={<AlertTriangle size={12}/>}>
                                                    Defekt gemeldet
                                                </Chip>
                                            )}
                                        </div>
                                        <p className="text-sm text-stone-500 mt-1">Rückgabe: {new Date(b.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {b.status === "AKZEPTIERT" && (
                                            <Button onPress={() => handleUpdateStatus(b.id, "AKTIV" as BookingStatus)} className="bg-blue-600 text-white">
                                                Abgeholt
                                            </Button>
                                        )}
                                        {b.status === "AKTIV" && (
                                            <Button onPress={() => setSelectedBooking(b)} className="bg-stone-800 text-white">
                                                Rückgabe
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {b.status === BookingStatus.AKZEPTIERT && (
                                    <div className="m-2 border-t border-stone-100 p-2">
                                        <div className="flex items-start gap-2">
                                            <Clock size={16} className="mt-1 text-stone-400"/>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-stone-500 uppercase">Abholtermin</span>

                                                {!hasProposals ? (
                                                    <p className="text-sm text-stone-400 italic">User hat noch keine Vorschläge gesendet.</p>
                                                ) : confirmedSlot ? (
                                                    <div className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-200 mt-1">
                                <span className="text-sm font-bold text-green-800">
                                    {new Date(confirmedSlot.start).toLocaleDateString()} {new Date(confirmedSlot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                                        <Chip size="sm" color="success" variant="flat">Bestätigt</Chip>
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 space-y-2">
                                                        <p className="text-xs text-orange-600 font-bold">Bitte Termin wählen:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {pickupSlots.map((slot) => (
                                                                <button
                                                                    key={slot.id}
                                                                    onClick={() => confirmSlotMutation.mutate({ slotId: slot.id, bookingId: b.id })}
                                                                    className="text-xs bg-white border border-stone-300 hover:border-forest-500 hover:bg-forest-50 px-3 py-2 rounded shadow-sm transition-all text-left"
                                                                >
                                                                    <div className="font-bold text-stone-700">
                                                                        {new Date(slot.start).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="text-stone-500">
                                                                        {new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(slot.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="border-t border-stone-100 px-2">
                                    <Accordion isCompact>
                                        <AccordionItem
                                            key="1"
                                            aria-label="Items"
                                            title={
                                                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                                    {b.items.length} Gegenstände anzeigen
                                                </span>
                                            }
                                        >
                                            <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {b.items.filter((bookingItem) => bookingItem.quantity > 0).map((bookingItem) => {
                                                    const reports = bookingItem.damageReports || [];
                                                    const isBroken = reports.length > 0;

                                                    return (
                                                        <div key={bookingItem.id}
                                                             className={`flex flex-col p-2 rounded-lg border ${isBroken ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-100'}`}>

                                                            {/* Item Header */}
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    src={bookingItem.item.imageUrl}
                                                                    radius="sm"
                                                                    size="md"
                                                                    className="bg-white"
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold text-stone-800 line-clamp-1">
                                                                        {bookingItem.item.name}
                                                                        {bookingItem.item.description && (
                                                                            <span className="text-xs text-stone-500 ml-1">
                                                                                ({bookingItem.item.description})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <div className="flex gap-2 text-xs text-stone-500">
                                                                        <span>Menge: <span className="font-mono font-bold text-stone-700">{bookingItem.quantity}x</span></span>
                                                                        <span>|</span>
                                                                        <span>Einzel: CHF {bookingItem.pricePerDay}</span>
                                                                    </div>
                                                                </div>
                                                                <div className='ml-auto flex items-center gap-2'>
                                                                    <button onClick={() => handleModifyBookingItems(b.id, [{ bookingItemId: bookingItem.id, newQuantity: bookingItem.quantity + 1 }])} className="p-1 hover:bg-stone-200 rounded transition-colors">
                                                                        <Plus size={16} className="text-stone-600" />
                                                                    </button>
                                                                    <span>/</span>
                                                                    <button onClick={() => handleModifyBookingItems(b.id, [{ bookingItemId: bookingItem.id, newQuantity: Math.max(0, bookingItem.quantity - 1) }])} className="p-1 hover:bg-stone-200 rounded transition-colors">
                                                                        <Minus size={16} className="text-stone-600" />
                                                                    </button>
                                                                    <button onClick={() => handleModifyBookingItems(b.id, [{ bookingItemId: bookingItem.id, newQuantity: 0 }])} className="p-1 hover:bg-red-100 rounded transition-colors">
                                                                        <Trash2 size={16} className="text-red-600" />
                                                                    </button>
                                                                    <span className="text-xs text-stone-500">
                                                                        Check:
                                                                    </span>
                                                                    <input
                                                                        type="checkbox"
                                                                        readOnly
                                                                        className="rounded border-stone-300 text-green-600 focus:ring-green-500 w-4 h-4"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            {isBroken && (
                                                                <div className="mt-2 pt-2 border-t border-red-100">
                                                                    <p className="text-[10px] font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                                                                        <AlertTriangle size={10}/> Meldung vom Nutzer:
                                                                    </p>
                                                                    {reports.map((report) => (
                                                                        <div key={report.id} className="bg-white p-2 rounded border border-red-100 mb-1">
                                                                            <p className="text-xs text-stone-700 italic mb-1">&#34;{report.description}&#34;</p>
                                                                            {report.imageUrl && (
                                                                                <Link
                                                                                    href={report.imageUrl}
                                                                                    isExternal
                                                                                    showAnchorIcon
                                                                                    anchorIcon={<ImageIcon size={12} className="ml-1" />}
                                                                                    size="sm"
                                                                                    color="danger"
                                                                                >
                                                                                    Foto ansehen
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className='w-full flex'>
                                                <Button variant="ghost" size="sm" className="ml-auto my-3" onPress={() => {
                                                    setActiveBookingForAddItem(b.id);
                                                    onOpen();
                                                }}>
                                                    Gerät hinzufügen
                                                </Button>
                                                <Modal isOpen={isOpen} size='5xl' onOpenChange={handleAddItemModalToggle}>
                                                    <ModalContent>
                                                        {(onClose) => {
                                                            const availableItems = (allItems || []).filter(item => item.availableStock > 0);
                                                            const selectedItem = availableItems.find(item => item.id === selectedItemToAdd);

                                                            return (
                                                                <div className="p-6 space-y-4">
                                                                    <h2 className="text-lg font-bold">Gerät hinzufügen</h2>
                                                                    <p className="text-sm text-stone-500">Wählen Sie ein verfügbares Gerät und eine Menge aus, um es der Buchung hinzuzufügen.</p>

                                                                    {isLoadingAllItems ? (
                                                                        <p className="text-sm text-stone-500">Lade verfügbare Geräte...</p>
                                                                    ) : !availableItems.length ? (
                                                                        <p className="text-sm text-stone-500">Keine verfügbaren Geräte zum Hinzufügen vorhanden.</p>
                                                                    ) : (
                                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                                            <label className="block text-sm text-stone-700">
                                                                                Gerät
                                                                                <select
                                                                                    value={selectedItemToAdd}
                                                                                    onChange={(event) => setSelectedItemToAdd(event.target.value)}
                                                                                    className="mt-1 w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                                                >
                                                                                    <option value="">Bitte wählen...</option>
                                                                                    {availableItems.map(item => (
                                                                                        <option key={item.id} value={item.id}>
                                                                                            {item.name} ({item.availableStock} verfügbar)
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </label>

                                                                            <label className="block text-sm text-stone-700">
                                                                                Menge
                                                                                <input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    value={newItemQuantity}
                                                                                    onChange={(event) => setNewItemQuantity(Math.max(1, Number(event.target.value) || 1))}
                                                                                    className="mt-1 w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    )}

                                                                    {selectedItem && (
                                                                        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                                                                            <p className="font-semibold">Ausgewähltes Gerät</p>
                                                                            <p>{selectedItem.name}</p>
                                                                            <p>CHF {selectedItem.pricePerDay.toFixed(2)} / Tag</p>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                                                                        <Button
                                                                            onPress={handleAddItemToBooking}
                                                                            disabled={!selectedItemToAdd || !activeBookingForAddItem || isLoadingAllItems || addItemToBookingMutation.status === "pending"}
                                                                        >
                                                                            Hinzufügen
                                                                        </Button>
                                                                        <Button variant="ghost" onPress={onClose} className="sm:ml-auto">
                                                                            Schließen
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }}
                                                    </ModalContent>
                                                </Modal>
                                            </div>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* COMPLETED */}
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
                <CheckoutFullscreenModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onConfirm={handleConfirmReturn}
                />
            )}
        </div>

    );
}