import { useApp } from '../store/AppContext';
import { Sparkles, Plus } from 'lucide-react';
import { MenuItem } from '../data/menuData';

function cvt(u: string) { const m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/); return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : u; }

export function Recommendations({ onAdd, onView }: { onAdd: (item: MenuItem) => void; onView: (item: MenuItem) => void }) {
  const { settings, menuItems, cart } = useApp();
  
  const rec = settings.recommendations;
  if (!rec?.enabled || cart.length === 0) return null;

  // Get categories of items in cart
  const cartCats = new Set(cart.map(ci => ci.menuItem.category));
  const cartIds = new Set(cart.map(ci => ci.menuItem.id));

  // Find items from same categories but not in cart, sorted by price
  let suggested = menuItems
    .filter(m => !cartIds.has(m.id) && cartCats.has(m.category) && !m.outOfStock)
    .slice(0, 6);

  // If not enough, add popular items from other categories
  if (suggested.length < 3) {
    const extra = menuItems.filter(m => !cartIds.has(m.id) && !m.outOfStock && !suggested.find(s => s.id === m.id)).slice(0, 6 - suggested.length);
    suggested = [...suggested, ...extra];
  }

  if (suggested.length === 0) return null;

  return (
    <div className="mt-3 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/50 rounded-2xl p-3 overflow-hidden">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          gap: 0.5rem;
          width: max-content;
          animation: scroll-left 15s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
        <span className="text-[11px] font-black text-purple-700">{rec.title || 'قد يعجبك أيضاً'}</span>
      </div>
      <div className="overflow-hidden pb-1" dir="ltr">
        <div className="animate-marquee" dir="rtl">
          {/* Double the items for seamless loop */}
          {[...suggested, ...suggested].map((item, idx) => {
            const img = item.images?.[0] ? cvt(item.images[0]) : '';
            return (
              <div key={`${item.id}-${idx}`} className="w-28 shrink-0 bg-white rounded-xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-md transition cursor-pointer group" onClick={() => onView(item)}>
                <div className={`h-20 bg-gradient-to-br ${item.colorClass} relative overflow-hidden`}>
                {img ? <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-2xl font-black text-white/40">{item.name.charAt(0)}</span></div>}
                <button onClick={e => { e.stopPropagation(); onAdd(item); }} className="absolute bottom-1 right-1 w-6 h-6 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white shadow opacity-0 group-hover:opacity-100 transition cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <div className="p-1.5">
                <p className="text-[9px] font-bold text-slate-800 line-clamp-1">{item.name}</p>
                <p className="text-[10px] font-black text-purple-600">{item.price} ر.س</p>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
