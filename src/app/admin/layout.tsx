"use client"

import React from 'react';
import {usePathname} from "next/navigation";
import Link from "next/link";
import {Button, Tab, Tabs} from "@heroui/react";
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
                <Tabs className="flex bg-stone-100 p-1 rounded-lg" color="primary" selectedKey={pathname}>
                    <Tab
                        key="/admin/bookings"
                        href="/admin/bookings"
                        title="Ausleihen"
                    >
                    </Tab>
                    <Tab
                        key="/admin/inventory"
                        href="/admin/inventory"
                        title="Inventar"
                    >
                    </Tab>
                </Tabs>
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