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

export const MOCK_ITEMS: Item[] = [
    {
        id: '1',
        name: 'Summit Pro 2-Personen-Zelt',
        description: 'Ultraleichtes 4-Jahreszeiten-Zelt für Hochgebirgstouren. Wind- und wasserdicht.',
        pricePerDay: 25,
        replacementCost: 350,
        category: 'unterkunft',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        totalStock: 5,
        availableStock: 5,
    },
    {
        id: '2',
        name: 'Tragbarer Propankocher',
        description: 'Zweilflammiger Campingkocher mit zuverlässiger Zündung und präziser Flammenregulierung.',
        pricePerDay: 10,
        replacementCost: 80,
        category: 'kochen',
        imageUrl: 'https://picsum.photos/400/300?random=2',
        totalStock: 8,
        availableStock: 8,
    },
    {
        id: '3',
        name: 'Glacier Daunenschlafsack',
        description: 'Für -10°C geeignet. Mumienform für effiziente Wärmespeicherung. Kompressionssack inklusive.',
        pricePerDay: 15,
        replacementCost: 200,
        category: 'schlafen',
        imageUrl: 'https://picsum.photos/400/300?random=3',
        totalStock: 10,
        availableStock: 10,
    },
    {
        id: '4',
        name: 'LumenMaster 500 Laterne',
        description: 'Wiederaufladbare LED-Laterne mit regulierbarer Helligkeit und Rotlichtmodus für Nachtsehen.',
        pricePerDay: 5,
        replacementCost: 40,
        category: 'beleuchtung',
        imageUrl: 'https://picsum.photos/400/300?random=4',
        totalStock: 15,
        availableStock: 15,
    },
];

