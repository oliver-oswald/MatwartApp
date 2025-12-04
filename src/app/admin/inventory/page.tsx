"use client"

import React from 'react';
import { Categories } from '@/types';
import { CATEGORIES } from '@/constants';
import {PlusCircle, Trash2, Loader2, Ghost} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {ItemFormData, itemFormSchema} from "@/lib/validators/item";
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";

export default function Page() {
    const utils = trpc.useUtils();

    console.log("fire")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemFormSchema),
        defaultValues: {
            name: '',
            category: CATEGORIES[0].id as Categories,
            pricePerDay: 10,
            totalStock: 1,
            description: '',
        }
    });

    const {data: items, isLoading} = trpc.getAllItems.useQuery()

    const addMutation = trpc.addItem.useMutation({
        onSuccess: () => {
            toast.success("Item hinzugefügt");
            reset();
            utils.getAllItems.invalidate();
        },
        onError: (err) => {
            toast.error(err.message || "Fehler beim Erstellen");
        }
    });

    const deleteMutation = trpc.deleteItem.useMutation({
        onSuccess: () => {
            toast.success("Item gelöscht");
            utils.getAllItems.invalidate();
        },
        onError: () => {
            toast.error("Fehler beim Löschen");
        }
    });

    const onSubmit = (data: ItemFormData) => {
        const payload = {
            ...data,
            replacementCost: data.pricePerDay * 5,
            availableStock: data.totalStock,
            imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`
        };
        console.log(payload)
        addMutation.mutate(payload);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 h-fit lg:col-span-1">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <PlusCircle className="text-forest-600" /> Gerät Hinzufügen
                </h3>

                <form onSubmit={handleSubmit(onSubmit, (errors) => console.log(errors))} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Item Name</label>
                        <input
                            {...register("name")}
                            className={`w-full rounded-md shadow-sm text-sm p-2 border ${errors.name ? "border-red-500" : "border-stone-300"}`}
                            placeholder="e.g. Mega Torch 2000"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Kategorie</label>
                            <select
                                {...register("category")}
                                className="w-full rounded-md border-stone-300 shadow-sm focus:border-forest-500 focus:ring-forest-500 text-sm p-2 border"
                            >
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Preis (CHF)</label>
                            <input
                                type="number"
                                step="0.5"
                                {...register("pricePerDay", {valueAsNumber: true})}
                                className={`w-full rounded-md shadow-sm text-sm p-2 border ${errors.pricePerDay ? "border-red-500" : "border-stone-300"}`}
                            />
                            {errors.pricePerDay && <p className="text-red-500 text-xs mt-1">{errors.pricePerDay.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Auf Lager</label>
                        <input
                            type="number"
                            {...register("totalStock", {valueAsNumber: true})}
                            className={`w-full rounded-md shadow-sm text-sm p-2 border ${errors.totalStock ? "border-red-500" : "border-stone-300"}`}
                        />
                        {errors.totalStock && <p className="text-red-500 text-xs mt-1">{errors.totalStock.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Beschreibung</label>
                        <textarea
                            {...register("description")}
                            className={`w-full rounded-md shadow-sm text-sm p-2 border h-24 ${errors.description ? "border-red-500" : "border-stone-300"}`}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={addMutation.isPending}
                        className="w-full bg-forest-700 text-white font-bold py-2 rounded-md hover:bg-forest-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {addMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Zum Inventar hinzufügen"}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-100 lg:col-span-2 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                    <h3 className="font-bold text-stone-700">Aktuell auf Lager</h3>
                    <span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded-full">{items?.length ?? '0'} Items</span>
                </div>
                <div className="overflow-y-auto max-h-[600px] p-0">
                    {isLoading &&
                        <div className="w-full mt-16 flex items-center flex-col h-full">
                            <Loader2 className="animate-spin" size={20}/>
                        </div>
                    }
                    {!items || items.length < 1 ?
                        <div className="mt-16 flex flex-col items-center gap-2">
                        <Ghost className="h-8 w-8 text-zinc-800"/>
                            <h3 className="font-semibold text-xl">Ziemlich leer hier</h3>
                            <p>
                                Lass das erste{" "}
                                <span className="font-medium">Gerät</span>
                                {" "}hinzufügen.
                            </p>
                        </div>
                        :
                        <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 text-stone-500 font-medium">
                            <tr>
                                <th className="p-3">Item</th>
                                <th className="p-3">Kategorie</th>
                                <th className="p-3 text-nowrap">Im Lager</th>
                                <th className="p-3">Preis</th>
                                <th className="p-3">Aktion</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-stone-50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img src={item.imageUrl}
                                                 className="w-10 h-10 rounded object-cover bg-stone-200"/>
                                            <div>
                                                <div className="font-medium text-stone-800">{item.name}</div>
                                                <div
                                                    className="text-xs text-stone-400 truncate max-w-[150px]">{item.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-stone-600 capitalize">{item.category}</td>
                                    <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-bold ${item.availableStock < 1 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {item.availableStock} / {item.totalStock}
                                    </span>
                                    </td>
                                    <td className="p-3 font-mono">CHF {item.pricePerDay}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => deleteMutation.mutate(item.id)}
                                            disabled={deleteMutation.isPending}
                                            className="text-stone-400 hover:text-red-600 transition-colors disabled:opacity-30"
                                        >
                                            {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16}/> :
                                                <Trash2 size={16}/>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>}
                </div>
            </div>
        </div>
    );
}