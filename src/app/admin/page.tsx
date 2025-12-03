"use client"

import {useRouter} from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter()
    router.push("/admin/bookings")
}