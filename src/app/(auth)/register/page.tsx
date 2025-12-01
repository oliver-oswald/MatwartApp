"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Tent, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {registerType, registerValidator} from "@/lib/validators/register";
import {trpc} from "@/app/_trpc/client";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export default function RegisterPage() {
    const router = useRouter();

    const onSubmit = (register: registerType) => {
        reset()
        mutate(register)
    }

    const {register, handleSubmit, formState: { errors }, reset} = useForm<registerType>({
        resolver: zodResolver(registerValidator)
    })

    const { mutate, isPending } = trpc.registerNewUser.useMutation({
        onSuccess() {
            router.push("/login")
        }
    })

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">

            <div className="mb-8 flex flex-col items-center">
                <div className="bg-forest-800 p-4 rounded-2xl shadow-lg mb-4 text-white">
                    <Tent size={40} />
                </div>
                <h1 className="text-3xl font-bold text-stone-800 tracking-tight">Konto erstellen</h1>
                <p className="text-stone-500 mt-2">Werde Teil des Teams!</p>
            </div>

            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-stone-100">

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name</label>
                        <input
                            {...register("name")}
                            type="text"
                            autoFocus
                            placeholder="Magnus Mustermann"
                            className="w-full rounded-lg border-stone-200 bg-stone-50 shadow-sm focus:border-forest-500 focus:ring-forest-500 p-3 transition-all"
                        />
                        {errors.name?.message !== undefined ? (
                            <p className="text-red-500 text-xs">{errors.name.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">E-Mail Adresse</label>
                        <input
                            {...register("email")}
                            type="text"
                            placeholder="name@example.com"
                            className="w-full rounded-lg border-stone-200 bg-stone-50 shadow-sm focus:border-forest-500 focus:ring-forest-500 p-3 transition-all"
                        />
                        {errors.email?.message !== undefined ? (
                            <p className="text-red-500 text-xs">{errors.email.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Passwort</label>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="Min. 8 Zeichen"
                            className="w-full rounded-lg border-stone-200 bg-stone-50 shadow-sm focus:border-forest-500 focus:ring-forest-500 p-3 transition-all"
                        />
                        {errors.password?.message !== undefined ? (
                            <p className="text-red-500 text-xs">{errors.password.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Passwort Bestätigen</label>
                        <input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="Passwort Bestätigen"
                            className="w-full rounded-lg border-stone-200 bg-stone-50 shadow-sm focus:border-forest-500 focus:ring-forest-500 p-3 transition-all"
                        />
                        {errors.confirmPassword?.message !== undefined ? (
                            <p className="text-red-500 text-xs absolute">{errors.confirmPassword.message}</p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={20}/> : (
                            <>
                                Registrieren <ArrowRight size={18}/>
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-stone-400">Bereits ein Konto?</span>
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/login" className="text-forest-700 font-semibold hover:underline">
                        Hier anmelden
                    </Link>
                </div>
            </div>
        </div>
    );
}