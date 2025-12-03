"use client"

import {Menu, Tent} from "lucide-react";
import Link from "next/link";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";
import {signOut} from "next-auth/react";
import {toast} from "react-hot-toast";
export default function Navbar() {

    return <nav className="flex-none bg-forest-900 text-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center group">
                        <span
                            className="text-2xl mr-2 transform group-hover:scale-110 transition-transform"><Tent/></span>
                    <span className="font-bold text-xl tracking-wide">Matwart App</span>
                </Link>
                <div className="flex space-x-4">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly>
                                <Menu />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="admin" href="/admin/bookings">Admin</DropdownItem>
                            <DropdownItem key="catalog" href="/browse">Katalog</DropdownItem>
                            <DropdownItem key="logout" color="secondary" onClick={async () => {
                                try {
                                    await signOut();
                                } catch (_) {
                                    toast.error("There was a problem signing out");
                                }
                            }}>Ausloggen</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
    </nav>
}