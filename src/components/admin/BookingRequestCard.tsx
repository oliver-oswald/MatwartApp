import React, { useState } from 'react';
import { BookingStatus } from '@/types';
import { Loader2, Save, X } from 'lucide-react';
import { Avatar, Chip, Input, Textarea, Button } from "@heroui/react";
import { toast } from "react-hot-toast";
import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
type RouterOutputs = inferRouterOutputs<AppRouter>;
type BookingWithDetails = RouterOutputs["getAllBookings"][number];

interface BookingRequestCardProps {
    booking: BookingWithDetails;
    onUpdateStatus: (id: string, status: BookingStatus) => void;
    onModifyAndApprove: (id: string, notes: string, items: { bookingItemId: string, newQuantity: number }[]) => void;
    isProcessing: boolean;
}

export function BookingRequestCard({ booking, onUpdateStatus, onModifyAndApprove, isProcessing }: BookingRequestCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    const [editNote, setEditNote] = useState(booking.adminNotes || '');
    const [quantities, setQuantities] = useState<{ [itemId: string]: number }>(
        booking.items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
    );

    const calculateProjectedTotal = () => {
        const diffTime = Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime());
        const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        let total = 0;
        booking.items.forEach(item => {
            const qty = quantities[item.id] ?? item.quantity;
            total += (qty * item.pricePerDay * duration);
        });
        return total;
    };

    const handleSave = () => {
        const hasChanges = booking.items.some(i => quantities[i.id] !== i.quantity);

        if (hasChanges && !editNote.trim()) {
            toast.error("Wenn du die Mengen änderst, musst du eine Notiz hinterlassen.");
            return;
        }

        const itemsPayload = Object.entries(quantities).map(([bItemId, qty]) => ({
            bookingItemId: bItemId,
            newQuantity: qty
        }));

        onModifyAndApprove(booking.id, editNote, itemsPayload);
    };

    if (!isEditing) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-l-4 border-l-amber-400 overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-stone-800 text-lg">{booking.user?.name}</p>
                            <Chip size="sm" color="warning" variant="flat">Warten</Chip>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">
                            {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-bold text-forest-700 mt-1">
                            Total: CHF {booking.totalRentalCost.toFixed(2)}
                        </p>
                        <div className="text-xs text-stone-400 mt-1">
                            {booking.items.length} Positionen
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            color="danger" variant="light" size="sm"
                            onPress={() => onUpdateStatus(booking.id, "ABGELEHNT" as BookingStatus)}
                            isDisabled={isProcessing}
                        >
                            Ablehnen
                        </Button>
                        <Button
                            size="sm" variant="bordered"
                            onPress={() => setIsEditing(true)}
                            isDisabled={isProcessing}
                        >
                            Bearbeiten
                        </Button>
                        <Button
                            color="success" className="text-white" size="sm"
                            onPress={() => onUpdateStatus(booking.id, "AKZEPTIERT" as BookingStatus)}
                            isDisabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : "Bestätigen"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-l-4 border-l-blue-500 overflow-hidden p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <h4 className="font-bold text-stone-700">Anfrage Bearbeiten</h4>
                <div className="text-right">
                    <span className="text-xs text-stone-400 block">Neues Total:</span>
                    <span className="font-bold text-forest-700">CHF {calculateProjectedTotal().toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-3">
                {booking.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                        <Avatar src={item.item.imageUrl} size="sm" radius="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.item.name}</p>
                            <p className="text-xs text-stone-400">Original: {item.quantity}x</p>
                        </div>
                        <div className="w-24">
                            <Input
                                type="number"
                                min={0}
                                size="sm"
                                label="Menge"
                                value={String(quantities[item.id])}
                                onValueChange={(v) => setQuantities(prev => ({ ...prev, [item.id]: Number(v) }))}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <Textarea
                    label="Grund für Änderung (Sichtbar für Nutzer)"
                    placeholder="z.B. Leider nur noch 1 Zelt verfügbar..."
                    value={editNote}
                    onValueChange={setEditNote}
                    minRows={2}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    variant="light" color="default"
                    onPress={() => setIsEditing(false)}
                    isDisabled={isProcessing}
                >
                    Abbrechen
                </Button>
                <Button
                    color="primary"
                    onPress={handleSave}
                    isDisabled={isProcessing}
                    startContent={isProcessing ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                >
                    Änderung Speichern & Bestätigen
                </Button>
            </div>
        </div>
    );
}