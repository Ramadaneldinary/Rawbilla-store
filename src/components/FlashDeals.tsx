import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Clock, Zap } from 'lucide-react';

function cvt(u: string) { const m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/); return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : u; }

function useCountdown(target: string) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      setLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [target]);
  return left;
}

function DealCard({ deal, item, onAdd }: { deal: { oldPrice: number; newPrice: number; endsAt: string }; item: { id: string; name: string; nameEn?: string; images: string[]; colorClass: string }; onAdd: () => void }) {
  const cd = useCountdown(deal.endsAt);
  if (cd.expired) return null;
  const discount = Math.round(((deal.oldPrice - deal.newPrice) / deal.oldPrice) * 100);
  const img = item.images?.[0] ? cvt(item.images[0]) : '';

  return (
    <div className="w-48 shrink-0 bg-white rounded-2xl border border-red-200/50 overflow-hidden shadow-md hover:shadow-xl transition-all group">
      <div className={`relative h-36 bg-gradient-to-br ${item.colorClass} overflow-hidden`}>
        {img && <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
        <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg animate-pulse">-{discount}%</div>
        {/* Countdown */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-white/80" />
            <div className="flex gap-1">
              {[{ v: cd.h, l: 'س' }, { v: cd.m, l: 'د' }, { v: cd.s, l: 'ث' }].map((t, i) => (
                <span key={i} className="bg-black/50 text-white text-[10px] font-black px-1.5 py-0.5 rounded min-w-[24px] text-center">
                  {String(t.v).padStart(2, '0')}<span className="text-[7px] text-white/60">{t.l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <h4 className="text-xs font-black text-slate-800 line-clamp-1">{item.name}</h4>
        {item.nameEn && <p className="text-[9px] italic font-semibold line-clamp-1" style={{ color: '#e97a1f' }}>{item.nameEn}</p>}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-black text-red-600">{deal.newPrice} ر.س</span>
          <span className="text-[10px] text-slate-400 line-through">{deal.oldPrice} ر.س</span>
        </div>
        <button onClick={onAdd} className="w-full mt-2 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-lg shadow cursor-pointer active:scale-95 transition">اطلب الآن</button>
      </div>
    </div>
  );
}

export function FlashDeals() {
  const { settings, menuItems, addToCart } = useApp();
  const fd = settings.flashDeals;
  if (!fd?.enabled || !fd.items?.length) return null;

  const activeDeals = fd.items.filter(d => new Date(d.endsAt).getTime() > Date.now());
  if (activeDeals.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow"><Zap className="w-4 h-4 fill-white" /></div>
        <h3 className="text-sm font-black text-red-700">عروض لفترة محدودة</h3>
        <div className="flex-1 h-px bg-red-100" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
        {activeDeals.map(deal => {
          const item = menuItems.find(m => m.id === deal.itemId);
          if (!item) return null;
          return <DealCard key={deal.itemId} deal={deal} item={item} onAdd={() => {
            // Add with deal price — create a copy with the discounted price
            const dealItem = { ...item, price: deal.newPrice, badge: `عرض خاص — كان ${deal.oldPrice} ر.س` };
            addToCart(dealItem, []);
          }} />;
        })}
      </div>
    </div>
  );
}
