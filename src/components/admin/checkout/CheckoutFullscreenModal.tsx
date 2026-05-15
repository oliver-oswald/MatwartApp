import React, { useState, useRef, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Booking, BrokenItemRecord } from '@/types';
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc";
import { ReceiptPreview, ReceiptItem } from './ReceiptPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Chip } from '@heroui/react';
import { X, FileDown, GripVertical } from 'lucide-react';
import { SortableContext as DndSortableContext } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type BookingWithDetails = RouterOutputs["getAllBookings"][number];

interface CheckoutFullscreenModalProps {
    booking: BookingWithDetails;
    onClose: () => void;
    onConfirm: (bookingId: string, brokenList: BrokenItemRecord[], totalCost: number, billNote: string) => void;
}

const isSameDay = (d1: Date | string, d2: Date | string) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

const SortableAvailableItem = ({ item }: { item: ReceiptItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex justify-between items-center p-3 bg-white border border-stone-200 rounded-lg shadow-sm mb-2 group">
            <div className="flex items-center gap-2">
                <div {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-500">
                    <GripVertical size={16} />
                </div>
                <div>
                    <p className="font-medium text-stone-800 text-sm">{item.name}</p>
                    <p className="text-xs text-stone-500">{item.quantity}x</p>
                </div>
            </div>
            <p className="font-mono text-sm text-stone-400">CHF {item.price.toFixed(2)}</p>
        </div>
    );
};

export function CheckoutFullscreenModal({ booking, onClose, onConfirm }: CheckoutFullscreenModalProps) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState(`Ausleihe für ${booking.user.name || 'Unbekannt'}`);
    const [discount, setDiscount] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize lists based on first day damages
    const initialLists = useMemo(() => {
        const available: ReceiptItem[] = [];
        const receipt: ReceiptItem[] = [];

        booking.items.forEach(cartItem => {
            if (cartItem.quantity === 0) return;

            const hasFirstDayDamage = cartItem.damageReports?.some(report =>
                isSameDay(report.createdAt, booking.startDate)
            );

            const rItem: ReceiptItem = {
                id: cartItem.id,
                name: cartItem.item.name,
                quantity: cartItem.quantity,
                price: cartItem.pricePerDay * cartItem.quantity,
                originalPrice: cartItem.pricePerDay * cartItem.quantity
            };

            if (hasFirstDayDamage) {
                available.push(rItem);
            } else {
                receipt.push(rItem);
            }
        });

        return { available, receipt };
    }, [booking]);

    const [availableItems, setAvailableItems] = useState<ReceiptItem[]>(initialLists.available);
    const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>(initialLists.receipt);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = availableItems.find(i => i.id === activeId) ? 'available' : 'receipt';
        const overContainer = overId === 'available-list' ? 'available' : overId === 'receipt-list' ? 'receipt' : (availableItems.find(i => i.id === overId) ? 'available' : 'receipt');

        if (activeContainer === overContainer) {
            // Reordering within same list
            const items = activeContainer === 'available' ? availableItems : receiptItems;
            const setItems = activeContainer === 'available' ? setAvailableItems : setReceiptItems;
            const oldIndex = items.findIndex(i => i.id === activeId);
            const newIndex = items.findIndex(i => i.id === overId);
            if (oldIndex !== newIndex) {
                setItems(arrayMove(items, oldIndex, newIndex));
            }
        } else {
            // Moving between lists
            const sourceList = activeContainer === 'available' ? availableItems : receiptItems;
            const destList = activeContainer === 'available' ? receiptItems : availableItems;
            const setSource = activeContainer === 'available' ? setAvailableItems : setReceiptItems;
            const setDest = activeContainer === 'available' ? setReceiptItems : setAvailableItems;

            const activeItem = sourceList.find(i => i.id === activeId)!;
            const overIndex = destList.findIndex(i => i.id === overId);
            const newIndex = overIndex >= 0 ? overIndex : destList.length;

            setSource(sourceList.filter(i => i.id !== activeId));
            const newDestList = [...destList];
            newDestList.splice(newIndex, 0, activeItem);
            setDest(newDestList);
        }
    };

    const handleUpdatePrice = (id: string, newPrice: number) => {
        setReceiptItems(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
    };

    const handleRemoveItem = (id: string) => {
        const item = receiptItems.find(i => i.id === id);
        if (item) {
            setReceiptItems(prev => prev.filter(i => i.id !== id));
            setAvailableItems(prev => [...prev, item]);
        }
    };

    const handleGeneratePdf = async () => {
        if (!previewRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(previewRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // A4 size: 210 x 297 mm
            const pdfWidth = 210;
            const pdfHeight = 297;
            const canvasRatio = canvas.height / canvas.width;

            let imgHeight = pdfWidth * canvasRatio;

            // If the content is longer than A4, it will be scaled down to fit, or we could add pages.
            // But since a Swiss QR bill *must* be at the exact bottom of A4, we scale to fit A4 perfectly.
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Quittung_${booking.user.name || 'Unbekannt'}.pdf`);

            // After generation, automatically finish the checkout via API
            const total = receiptItems.reduce((sum, item) => sum + item.price, 0) - discount;
            const brokenList: BrokenItemRecord[] = []; // Calculate broken list if any
            onConfirm(booking.id, brokenList, total, "Checkout via PDF Receipt");

        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-100 flex overflow-hidden">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

                {/* Left Sidebar */}
                <div className="w-1/4 min-w-[300px] max-w-[400px] bg-stone-50 border-r border-stone-200 flex flex-col shadow-lg z-10">
                    <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-white">
                        <h2 className="font-bold text-stone-800">Verfügbare Artikel</h2>
                        <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <p className="text-xs text-stone-500 mb-4">
                            Artikel hier können per Drag & Drop auf die Quittung gezogen werden.
                        </p>
                        <DndSortableContext items={availableItems.map(i => i.id)} strategy={verticalListSortingStrategy} id="available-list">
                            <div className="min-h-[200px] p-2 bg-stone-100 rounded-lg border-2 border-dashed border-stone-200">
                                {availableItems.length === 0 && (
                                    <p className="text-stone-400 text-sm italic text-center py-4">Leer</p>
                                )}
                                {availableItems.map(item => (
                                    <SortableAvailableItem key={item.id} item={item} />
                                ))}
                            </div>
                        </DndSortableContext>
                    </div>

                    <div className="p-4 bg-white border-t border-stone-200">
                        <Button
                            color="primary"
                            className="w-full font-bold shadow-lg bg-forest-700 hover:bg-forest-800"
                            size="lg"
                            startContent={<FileDown size={18} />}
                            isLoading={isGenerating}
                            onPress={handleGeneratePdf}
                        >
                            PDF Generieren & Abschliessen
                        </Button>
                    </div>
                </div>

                {/* Right Area (Preview) */}
                <div className="flex-1 overflow-y-auto flex justify-center bg-stone-300">
                    <DndSortableContext items={receiptItems.map(i => i.id)} strategy={verticalListSortingStrategy} id="receipt-list">
                        <ReceiptPreview
                            previewRef={previewRef}
                            title={title}
                            setTitle={setTitle}
                            items={receiptItems}
                            discount={discount}
                            setDiscount={setDiscount}
                            debtorName={booking.user.name || 'Unbekannt'}
                            onUpdatePrice={handleUpdatePrice}
                            onRemoveItem={handleRemoveItem}
                        />
                    </DndSortableContext>
                </div>
            </DndContext>
        </div>
    );
}
