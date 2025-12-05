import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Image } from "@heroui/react";
import { Camera, Loader2, UploadCloud } from 'lucide-react';
import { toast } from "react-hot-toast";

interface DamageReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    onSubmit: (description: string, imageUrl: string) => void;
    isSubmitting: boolean;
}

export function DamageReportModal({ isOpen, onClose, itemName, onSubmit, isSubmitting }: DamageReportModalProps) {
    const [description, setDescription] = useState('');
    const [mockImage, setMockImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleMockUpload = () => {
        setIsUploading(true);
        // Simulate network delay
        setTimeout(() => {
            const randomId = Math.floor(Math.random() * 1000);
            setMockImage(`https://picsum.photos/seed/${randomId}/500/300`);
            setIsUploading(false);
            toast.success("Foto erfolgreich hochgeladen!");
        }, 1500);
    };

    const handleSubmit = () => {
        if (!description) return toast.error("Bitte beschreibe den Schaden.");
        if (!mockImage) return toast.error("Bitte lade ein Foto hoch.");

        onSubmit(description, mockImage);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="center">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Defekt melden: {itemName}
                    <span className="text-xs font-normal text-stone-500">
                        Melde Schäden bei Erhalt, damit sie dir nicht verrechnet werden.
                    </span>
                </ModalHeader>
                <ModalBody>
                    <Textarea
                        label="Beschreibung"
                        placeholder="Riss im Stoff, Reissverschluss klemmt..."
                        value={description}
                        onValueChange={setDescription}
                    />

                    {/* Fake Upload Area */}
                    <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-stone-50 transition-colors hover:bg-stone-100">
                        {mockImage ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                                <Image src={mockImage} alt="Defekt" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setMockImage(null)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                >
                                    Foto ändern
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="bg-stone-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-500">
                                    <Camera size={24} />
                                </div>
                                <p className="text-sm text-stone-500 mb-3">Foto vom Schaden machen</p>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    isLoading={isUploading}
                                    onPress={handleMockUpload}
                                    startContent={!isUploading && <UploadCloud size={16} />}
                                >
                                    {isUploading ? "Wird hochgeladen..." : "Foto hochladen"}
                                </Button>
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Abbrechen
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                        isDisabled={!mockImage || !description}
                    >
                        Meldung absenden
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}