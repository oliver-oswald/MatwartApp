"use client"
import { Tent } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const navItems = [
        { name: 'Katalog', href: '/browse' },
        { name: 'Admin', href: '/admin' }
    ];
    const
        pathname= usePathname()

    return <nav className="flex-none bg-forest-900 text-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center group">
                        <span
                            className="text-2xl mr-2 transform group-hover:scale-110 transition-transform"><Tent/></span>
                    <span className="font-bold text-xl tracking-wide">Matwart App</span>
                </Link>
                <div className="flex space-x-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                pathname === item.href
                                    ? 'bg-forest-700 text-white'
                                    : 'text-forest-200 hover:bg-forest-800'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </nav>
}