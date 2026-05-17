import { Item } from "./types";

export const CATEGORIES: {
    id: string;
    label: string;
    icon: string;
}[] = [
    { id: "kitchen", label: "Küche", icon: "🍳" },
    { id: "tools", label: "Werkzeuge", icon: "🪓" },
    { id: "tents", label: "Zelte & Blachen", icon: "⛺" },
    { id: "ropes", label: "Seile & Spannsets", icon: "🪢" },
    { id: "climbing", label: "Klettern & Rettung", icon: "🧗" },
    { id: "storage", label: "Lagerung", icon: "📦" },
    { id: "cooking", label: "Outdoor Kochen", icon: "🔥" },
    { id: "construction", label: "Bau & Material", icon: "🛠️" },
    { id: "lighting", label: "Beleuchtung", icon: "🏮" },
    { id: "navigation", label: "Navigation", icon: "🧭" },
    { id: "safety", label: "Sicherheit & Apotheke", icon: "🚑" },
    { id: "camouflage", label: "Tarnung", icon: "🌲" },
    { id: "sanitary", label: "Sanitär", icon: "🚽" },
    { id: "misc", label: "Sonstiges", icon: "🎒" },
];
