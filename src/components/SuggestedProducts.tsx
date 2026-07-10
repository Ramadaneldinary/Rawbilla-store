import React from 'react';
import { useApp } from '../context/AppContext';

export const SuggestedProducts = ({ addToCart }: { addToCart: (product: any) => void }) => {
  const { settings, cart } = useApp();
  
  // تصفية ذكية: عرض منتجات ليست في السلة ومحدودة بـ 3 عناصر
  const cartIds = cart.map((item: any) => item.id);
  const suggestions = (settings.products || [])
    .filter((product: any) => !cartIds.includes(product.id))
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-bold mb-3 text-sm">قد يعجبك أيضاً:</h4>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {suggestions.map((p: any) => (
          <button
            key={p.id}
            onClick={() => addToCart(p)}
            className="flex-shrink-0 px-3 py-2 border rounded-lg text-xs hover:bg-gray-50 transition"
          >
            {p.name} - {p.price}
          </button>
        ))}
      </div>
    </div>
  );
};
