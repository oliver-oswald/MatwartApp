"use client"

import React from 'react';
import {usePathname} from "next/navigation";
import Link from "next/link";
import {Button} from "@heroui/react";
import {User} from "lucide-react";

export default function AdminDashboard({children}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full bg-stone-100">
            {/* Header / Tabs */}
            <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4">
                <h2 className="text-xl font-bold text-stone-800">Admin Console</h2>
                <div className="flex bg-stone-100 p-1 rounded-lg">
                    <Link
                        href="/admin/bookings"
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            pathname.includes('bookings') ? 'bg-white text-forest-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                        Ausleihen
                    </Link>
                    <Link
                        href="/admin/inventory"
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            pathname.includes('inventory') ? 'bg-white text-forest-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                        Inventar
                    </Link>
                </div>
                <Link href="/admin/users" className="ml-auto">
                <Button isIconOnly variant="bordered">
                    <User></User>
                </Button>
            </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {children}
            </div>
        </div>
    );
}