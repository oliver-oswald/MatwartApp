import React, {useEffect} from 'react';
import { CartItem } from '@/types';
import { Image } from '@/components/ui/next-shim';
import {X, Backpack, Loader2} from 'lucide-react';
import {toast} from "react-hot-toast";
import {useForm} from "react-hook-form";
import {addBookingValidator, bookingType} from "@/lib/validators/booking";
import {zodResolver} from "@hookform/resolvers/zod";
import {trpc} from "@/app/_trpc/client";
interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
}

export function CartDrawer({
                               isOpen,
                               onClose,
                               cart,
                               onRemove,
                               onUpdateQuantity
                           }: CartDrawerProps) {

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<bookingType>({
        resolver: zodResolver(addBookingValidator)
    })

    useEffect(() => {
        const formattedItems = cart.map(i => ({ id: i.id, quantity: i.quantity }));
        setValue("items", formattedItems);
    }, [cart, setValue]);

    const startDate = watch("startDate");
    const endDate = watch("endDate");

    const { mutate, isPending } = trpc.addBooking.useMutation({
        onSuccess(){
            toast.success("Buchung wurde eingereicht")
            onClose()
            reset()
        },
        onError(){
            toast.error("Fehler bei der Buchung!")
        }
    })

    if (!isOpen) return null;

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const dailyTotal = cart.reduce((acc, item) => acc + item.pricePerDay * item.quantity, 0);
        return dailyTotal * diffDays;
    };

    const onSubmit = (booking: bookingType) => {
        if (cart.length === 0) {
            toast.error('Dein Rucksack ist leer!');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.error('Rückgabe kann nich vor der Abholung sein!');
            return;
        }
        mutate(booking)
        reset()
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">

                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <Backpack className="text-forest-600"/>
                        Dein Rucksack
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500">
                        <X size={20}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-10 text-stone-400">
                            <p>Dein Rucksack ist leer.</p>
                            <p className="text-sm">Füge paar Materialien für dein Lager hinzu!</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id}
                                 className="flex gap-4 items-center bg-white border border-stone-100 p-3 rounded-lg shadow-sm">
                                <Image src={item.imageUrl} alt="" width={64} height={64}
                                       className="rounded object-cover bg-stone-100"/>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-stone-800 text-sm">{item.name}</h4>
                                    <p className="text-xs text-stone-500">CHF {item.pricePerDay} / tag</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onUpdateQuantity(item.id, -1)} type="button"
                                            className="w-6 h-6 flex items-center justify-center rounded bg-stone-100 text-stone-600 hover:bg-stone-200">-
                                    </button>
                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, 1)} type="button"
                                            className="w-6 h-6 flex items-center justify-center rounded bg-stone-100 text-stone-600 hover:bg-stone-200">+
                                    </button>
                                </div>
                                <button onClick={() => onRemove(item.id)} type="button"
                                        className="text-stone-400 hover:text-red-500 ml-2">
                                    <X size={16}/>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-4 border-t border-stone-100 bg-stone-50">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Items are handled via useEffect/setValue, but checking errors here is good */}
                            {errors.items && (
                                <p className="text-red-500 text-xs">{errors.items.message}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-xs font-bold text-stone-500 uppercase mb-1">Abholung</label>
                                    <input
                                        type="date"
                                        className={`w-full rounded-md shadow-sm text-sm p-2 border ${errors.startDate ? 'border-red-500' : 'border-stone-200'}`}
                                        {...register("startDate")}
                                    />
                                    {errors.startDate && (
                                        <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-bold text-stone-500 uppercase mb-1">Rückgabe</label>
                                    <input
                                        type="date"
                                        className={`w-full rounded-md shadow-sm text-sm p-2 border ${errors.endDate ? 'border-red-500' : 'border-stone-200'}`}
                                        {...register("endDate")}
                                    />
                                    {errors.endDate && (
                                        <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 text-stone-700 font-medium">
                                <span>Geschätzte Kosten:</span>
                                <span
                                    className="text-xl font-bold text-forest-700">CHF {calculateTotal().toFixed(2)}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 flex justify-center items-center gap-2"
                            >
                                {isPending ? <Loader2 className="animate-spin" size={20}/> : "Ausleihe Anfragen"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}