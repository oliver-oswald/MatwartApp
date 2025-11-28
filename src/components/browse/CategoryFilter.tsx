import React from 'react';
import { CATEGORIES } from '@/constants';

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="bg-white shadow-sm px-4 py-3 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide z-10 relative">
            <button
                onClick={() => onSelectCategory('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                        ? 'bg-forest-800 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
            >
                Alles
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedCategory === cat.id
                            ? 'bg-forest-800 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                    <span>{cat.icon}</span>
                    {cat.label}
                </button>
            ))}
        </div>
    );
}