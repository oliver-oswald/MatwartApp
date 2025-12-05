import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { Plus, Trash2, Clock } from 'lucide-react';
import { toast } from "react-hot-toast";

interface PickupProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (slots: { start: Date, end: Date }[]) => void;
    isSubmitting: boolean;
    bookingStartDate: Date;
}

export function PickupProposalModal({ isOpen, onClose, onSubmit, isSubmitting, bookingStartDate }: PickupProposalModalProps) {
    const [slots, setSlots] = useState([{ date: '', startTime: '17:00', endTime: '18:00' }]);

    const addRow = () => {
        setSlots([...slots, { date: '', startTime: '17:00', endTime: '18:00' }]);
    };

    const removeRow = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateRow = (index: number, field: "date" | "startTime" | "endTime", value: string) => {
        const newSlots = [...slots];
        newSlots[index][field] = value;
        setSlots(newSlots);
    };

    const handleSubmit = () => {
        const parsedSlots = [];

        for (const slot of slots) {
            if (!slot.date || !slot.startTime || !slot.endTime) {
                toast.error("Bitte alle Felder ausfüllen");
                return;
            }

            const start = new Date(`${slot.date}T${slot.startTime}`);
            const end = new Date(`${slot.date}T${slot.endTime}`);
            const bookingStart = new Date(bookingStartDate);

            if (start > bookingStart) {
                toast.error("Abholung muss VOR dem Startdatum sein!");
                return;
            }
            if (start >= end) {
                toast.error("Endzeit muss nach Startzeit sein");
                return;
            }

            parsedSlots.push({ start, end });
        }

        onSubmit(parsedSlots);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="text-forest-600" />
                        Abholung vorschlagen
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p className="text-sm text-stone-500 mb-4">
                        Schlage 1-3 Termine vor, an denen du das Material abholen kannst.
                        Der Materialwart wird einen davon bestätigen.
                    </p>

                    <div className="space-y-3">
                        {slots.map((slot, idx) => (
                            <div key={idx} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-stone-500">Datum</label>
                                    <Input
                                        type="date"
                                        size="sm"
                                        value={slot.date}
                                        onChange={(e) => updateRow(idx, 'date', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-bold text-stone-500">Von</label>
                                    <Input
                                        type="time"
                                        size="sm"
                                        value={slot.startTime}
                                        onChange={(e) => updateRow(idx, 'startTime', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-bold text-stone-500">Bis</label>
                                    <Input
                                        type="time"
                                        size="sm"
                                        value={slot.endTime}
                                        onChange={(e) => updateRow(idx, 'endTime', e.target.value)}
                                    />
                                </div>
                                {slots.length > 1 && (
                                    <Button isIconOnly color="danger" variant="light" onPress={() => removeRow(idx)}>
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        size="sm" variant="flat" className="mt-2 w-full"
                        startContent={<Plus size={16}/>} onPress={addRow}
                    >
                        Weiteren Termin hinzufügen
                    </Button>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>Abbrechen</Button>
                    <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
                        Vorschläge senden
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}