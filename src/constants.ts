import { Item } from "./types";

export const CATEGORIES = [
    { id: 'unterkunft', label: 'Unterkunft', icon: '⛺' },
    { id: 'kochen', label: 'Kochen', icon: '🍳' },
    { id: 'schlafen', label: 'Schlafen', icon: '💤' },
    { id: 'beleuchtung', label: 'Beleuchtung', icon: '🔦' },
    { id: 'sonstiges', label: 'Sonstiges', icon: '🎒' },
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

