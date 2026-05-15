import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateSwissQRString } from '@/lib/swissqr';
import { useSortable, SortableContext as DndSortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

export interface ReceiptItem {
    id: string; // The BookingItem id
    name: string;
    quantity: number;
    price: number; // The dynamic price set during checkout
    originalPrice: number; // For reference
}

interface ReceiptPreviewProps {
    title: string;
    setTitle: (v: string) => void;
    items: ReceiptItem[];
    discount: number;
    setDiscount: (v: number) => void;
    debtorName: string;
    onUpdatePrice: (id: string, price: number) => void;
    onRemoveItem: (id: string) => void;
    previewRef: React.RefObject<HTMLDivElement | null>;
}

const SortableReceiptItem = ({ item, onUpdatePrice, onRemoveItem }: { item: ReceiptItem, onUpdatePrice: (id: string, p: number) => void, onRemoveItem: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [tempPrice, setTempPrice] = useState(item.price.toString());

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSavePrice = (onClose: () => void) => {
        const parsed = parseFloat(tempPrice);
        if (!isNaN(parsed)) {
            onUpdatePrice(item.id, parsed);
        }
        onClose();
    };

    return (
        <>
            <div ref={setNodeRef} style={style} className="flex justify-between items-center py-2 border-b border-stone-100 group bg-white">
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-500">
                        <GripVertical size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-stone-800 text-sm">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.quantity}x</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="font-mono text-sm">CHF {item.price.toFixed(2)}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button onClick={onOpen} className="p-1 text-stone-400 hover:text-blue-600 rounded">
                            <Pencil size={14} />
                        </button>
                        <button onClick={() => onRemoveItem(item.id)} className="p-1 text-stone-400 hover:text-red-600 rounded">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Preis anpassen</ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-stone-500 mb-2">Passe den Preis für {item.name} an.</p>
                                <Input
                                    type="number"
                                    label="Neuer Preis (CHF)"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    step="0.05"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Abbrechen</Button>
                                <Button color="primary" onPress={() => handleSavePrice(onClose)}>Speichern</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

const DroppableReceiptList = ({ items, children }: { items: ReceiptItem[], children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id: 'receipt-list' });
    return (
        <DndSortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy} id="receipt-list">
            <div ref={setNodeRef} className="flex flex-col min-h-[50px]">
                {children}
            </div>
        </DndSortableContext>
    );
};

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
    title, setTitle, items, discount, setDiscount, debtorName, onUpdatePrice, onRemoveItem, previewRef
}) => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const total = Math.max(0, subtotal - discount);

    const { isOpen: isDiscountOpen, onOpen: onDiscountOpen, onOpenChange: onDiscountChange } = useDisclosure();
    const [tempDiscount, setTempDiscount] = useState(discount.toString());

    const { isOpen: isTitleOpen, onOpen: onTitleOpen, onOpenChange: onTitleChange } = useDisclosure();
    const [tempTitle, setTempTitle] = useState(title);

    const handleSaveDiscount = (onClose: () => void) => {
        const parsed = parseFloat(tempDiscount);
        if (!isNaN(parsed)) {
            setDiscount(parsed);
        }
        onClose();
    };

    const handleSaveTitle = (onClose: () => void) => {
        setTitle(tempTitle);
        onClose();
    };

    const qrData = generateSwissQRString(total, debtorName);
    const swissCrossSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23000"/><path d="M40 20h20v20h20v20H60v20H40V60H20V40h20z" fill="%23fff"/></svg>';

    return (
        <div className="bg-stone-200/50 p-8 min-h-full flex justify-center items-start overflow-y-auto w-full">
            <div
                ref={previewRef}
                className="bg-white shadow-xl flex flex-col relative print-friendly-receipt"
                style={{ width: '210mm', minHeight: '297mm', padding: '0' }} // A4 aspect ratio, though actual size is determined by zoom or scale
            >
                <div className="p-12 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-12 group cursor-pointer" onClick={onTitleOpen}>
                        <div>
                            <h1 className="text-3xl font-light text-stone-800">{title}</h1>
                            <p className="text-stone-400 text-sm mt-1">Für {debtorName}</p>
                        </div>
                        <div className="text-right">
                            <img src="/icon.svg" className="w-12 h-12 opacity-80 inline-block mb-2 grayscale" alt="Logo" />
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Matwart Pfadi</p>
                        </div>
                        <Pencil size={16} className="text-stone-300 opacity-0 group-hover:opacity-100 ml-4 mt-2" />
                    </div>

                    <div className="mb-6 flex-1">
                        <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-wider border-b-2 border-stone-800 pb-2 mb-4">
                            <span>Positionen</span>
                            <span>Betrag</span>
                        </div>

                        {items.length === 0 ? (
                            <DroppableReceiptList items={items}>
                                <p className="text-stone-400 italic text-sm text-center py-10">Ziehe Artikel hierher, um sie zur Rechnung hinzuzufügen.</p>
                            </DroppableReceiptList>
                        ) : (
                            <DroppableReceiptList items={items}>
                                {items.map(item => (
                                    <SortableReceiptItem
                                        key={item.id}
                                        item={item}
                                        onUpdatePrice={onUpdatePrice}
                                        onRemoveItem={onRemoveItem}
                                    />
                                ))}
                            </DroppableReceiptList>
                        )}
                    </div>

                    <div className="mt-8 border-t border-stone-200 pt-4 w-1/2 ml-auto">
                        <div className="flex justify-between text-sm mb-2 text-stone-500">
                            <span>Zwischentotal</span>
                            <span className="font-mono">CHF {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 text-stone-500 group cursor-pointer" onClick={onDiscountOpen}>
                            <span className="flex items-center gap-1">Rabatt <Pencil size={12} className="opacity-0 group-hover:opacity-100" /></span>
                            <span className="font-mono text-red-500">- CHF {discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t-2 border-stone-800 pt-2 mt-2 text-stone-800">
                            <span>Total</span>
                            <span className="font-mono">CHF {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Swiss QR Bill Payment Part at the bottom */}
                <div className="mt-auto border-t border-dashed border-stone-300 h-[105mm] flex relative p-0 bg-white">
                    <div className="w-[62mm] border-r border-dashed border-stone-300 p-4 pt-6 text-[10px]">
                        <h2 className="font-bold text-sm mb-2">Empfangsschein</h2>
                        <p className="font-bold mb-1">Konto / Zahlbar an</p>
                        <p>{process.env.NEXT_PUBLIC_BANK_IBAN || 'CH93 0000 0000 0000 0000 0'}</p>
                        <p>{process.env.NEXT_PUBLIC_BANK_NAME || 'Matwart Pfadi'}<br />{process.env.NEXT_PUBLIC_BANK_STREET || 'Musterstr 1'}<br />{process.env.NEXT_PUBLIC_BANK_ZIP || '8000'} {process.env.NEXT_PUBLIC_BANK_CITY || 'Zürich'}</p>
                        <br />
                        <p className="font-bold mb-1">Zahlbar durch</p>
                        <p>{debtorName}</p>

                        <div className="mt-8">
                            <span className="font-bold text-lg">CHF</span>
                            <span className="font-bold text-lg ml-4">{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex-1 p-4 pt-6 flex gap-6 text-[10px]">
                        <div>
                            <h2 className="font-bold text-sm mb-2">Zahlteil</h2>
                            <QRCodeSVG
                                value={qrData}
                                size={180}
                                level="M"
                                imageSettings={{
                                    src: swissCrossSvg,
                                    x: undefined,
                                    y: undefined,
                                    height: 30,
                                    width: 30,
                                    excavate: true,
                                }}
                            />
                            <div className="mt-4">
                                <span className="font-bold text-lg">CHF</span>
                                <span className="font-bold text-lg ml-4">{total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold mb-1">Konto / Zahlbar an</p>
                            <p>{process.env.NEXT_PUBLIC_BANK_IBAN || 'CH93 0000 0000 0000 0000 0'}</p>
                            <p>{process.env.NEXT_PUBLIC_BANK_NAME || 'Matwart Pfadi'}<br />{process.env.NEXT_PUBLIC_BANK_STREET || 'Musterstr 1'}<br />{process.env.NEXT_PUBLIC_BANK_ZIP || '8000'} {process.env.NEXT_PUBLIC_BANK_CITY || 'Zürich'}</p>
                            <br />
                            <p className="font-bold mb-1">Zusätzliche Informationen</p>
                            <p>Rechnung für Materialmiete</p>
                            <br />
                            <p className="font-bold mb-1">Zahlbar durch</p>
                            <p>{debtorName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title Modal */}
            <Modal isOpen={isTitleOpen} onOpenChange={onTitleChange} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Titel anpassen</ModalHeader>
                            <ModalBody>
                                <Input value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Abbrechen</Button>
                                <Button color="primary" onPress={() => handleSaveTitle(onClose)}>Speichern</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Discount Modal */}
            <Modal isOpen={isDiscountOpen} onOpenChange={onDiscountChange} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Rabatt gewähren</ModalHeader>
                            <ModalBody>
                                <Input type="number" label="Rabatt (CHF)" value={tempDiscount} onChange={(e) => setTempDiscount(e.target.value)} step="0.05" />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Abbrechen</Button>
                                <Button color="primary" onPress={() => handleSaveDiscount(onClose)}>Speichern</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};
