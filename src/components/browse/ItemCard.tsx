import React from 'react';
import { Item } from '@/types';
import { Image } from '@/components/ui/next-shim';
import { Plus } from 'lucide-react';

interface ItemCardProps {
    item: Item;
    onAddToCart: (item: Item) => void;
}

export function ItemCard({ item, onAddToCart }: ItemCardProps) {
    const isOutOfStock = item.availableStock === 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 relative bg-stone-200">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-forest-800 backdrop-blur-sm">
                    CHF {item.pricePerDay}/tag
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-stone-800 leading-tight">{item.name}</h3>
                </div>
                <p className="text-stone-500 text-sm mb-4 flex-1">{item.description}</p>
                <div className="flex justify-between items-center mt-auto">
          <span
              className={`text-xs px-2 py-1 rounded-full ${
                  !isOutOfStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
          >
            {item.availableStock} verfügbar
          </span>
                    <button
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart(item)}
                        className="bg-forest-600 hover:bg-forest-700 disabled:bg-stone-300 text-white p-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}