"use client"

import React from 'react';
import { trpc } from "@/app/_trpc/client";
import { toast } from "react-hot-toast";
import { Users, Shield, ShieldAlert, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import { Role } from '@prisma/client'; // Or from '@/types'

export default function UserManager() {
    const utils = trpc.useUtils();

    const { data: users, isLoading } = trpc.getAllUsers.useQuery();

    const updateRoleMutation = trpc.updateUserRole.useMutation({
        onSuccess: (data) => {
            toast.success(`Rolle geändert zu: ${data.newRole}`);
            utils.getAllUsers.invalidate();
        },
        onError: (err) => toast.error(err.message)
    });

    const deleteUserMutation = trpc.deleteUser.useMutation({
        onSuccess: () => {
            toast.success("Nutzer gelöscht");
            utils.getAllUsers.invalidate();
        },
        onError: (err) => toast.error(err.message)
    });

    const handleRoleToggle = (userId: string, currentRole: string) => {
        const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
        updateRoleMutation.mutate({ userId, role: newRole as Role });
    };

    const handleDelete = (userId: string, userName: string) => {
        if (confirm(`Bist du sicher, dass du ${userName} löschen willst? Das kann nicht rückgängig gemacht werden.`)) {
            deleteUserMutation.mutate({ userId });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-stone-400" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2">
                    <Users className="text-forest-600" /> Nutzer Verwaltung
                </h3>
                <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-full font-bold">
                    {users?.length || 0}
                </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 text-stone-500 font-medium">
                        <tr>
                            <th className="p-4">Name / Email</th>
                            <th className="p-4">Rolle</th>
                            <th className="p-4 text-right">Aktionen</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                        {users?.map(user => (
                            <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar or Placeholder */}
                                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 overflow-hidden border border-stone-100">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-stone-800">{user.name || "Kein Name"}</div>
                                            <div className="text-xs text-stone-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            user.role === "ADMIN"
                                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                                : 'bg-stone-100 text-stone-600 border-stone-200'
                                        }`}>
                                            {user.role === "ADMIN" ? <ShieldAlert size={12} /> : <Shield size={12} />}
                                            {user.role}
                                        </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Change Role Button */}
                                        <button
                                            onClick={() => handleRoleToggle(user.id, user.role)}
                                            disabled={updateRoleMutation.isPending}
                                            className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 text-stone-600 rounded hover:bg-stone-50 hover:text-stone-900 transition-colors"
                                        >
                                            {user.role === "ADMIN" ? "Zum User machen" : "Zum Admin machen"}
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(user.id, user.name || "User")}
                                            disabled={deleteUserMutation.isPending}
                                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Nutzer löschen"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}