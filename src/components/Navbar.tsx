import { Tent } from "lucide-react";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import {auth} from "@/lib/auth";

export default async function Navbar() {
    const navItems = [
        { name: 'Katalog', href: '/browse' },
        { name: 'Admin', href: '/admin' }
    ];

    const session = await auth()

    return <nav className="flex-none bg-forest-900 text-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center group">
                        <span
                            className="text-2xl mr-2 transform group-hover:scale-110 transition-transform"><Tent/></span>
                    <span className="font-bold text-xl tracking-wide">Matwart App</span>
                </Link>
                <div className="flex space-x-4">
                    {session?.user.role === "ADMIN" && navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-forest-200 hover:bg-forest-800'`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    {!session?.user ? (
                        <div className="my-auto mr-4">
                            <a
                                href="/login"
                            >
                                Login
                            </a>
                        </div>
                    ) : (
                        <div className="mx-6 mt-auto flex items-center">
                            <div className="flex flex-1 items-center gap-x-4 text-sm font-semibold leading-6 text-white mr-2">
                                <span className="sr-only">Your profile</span>
                                <div className="flex flex-col">
                                    <span aria-hidden="true">{session.user.name}</span>
                                    <span
                                        className="text-xs text-white"
                                        aria-hidden="true"
                                    >
                              {session.user.email}
                            </span>
                                </div>
                            </div>

                            <SignOutButton className="h-full aspect-square" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </nav>
}