import { useState } from 'react';
import { MenuItem } from '../data/menuData';
import { useApp } from '../store/AppContext';
import { Plus, Star, Eye, ShoppingBag, Check, Share2 } from 'lucide-react';
import { getShareUrl, getOrderCount } from '../utils/social';

function convertUrl(url: string): string {
  if (!url) return '';
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (m3) return `https://lh3.googleusercontent.com/d/${m3[1]}`;
  return url;
}

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onViewDetail: (item: MenuItem) => void;
}

export function MenuCard({ item, onSelect, onViewDetail }: MenuCardProps) {
  const { settings } = useApp();
  const dietaryFilters = (settings.dietaryFilters || []).filter(d => d.enabled);
  const imgs = (item.images || []).map(convertUrl).filter(Boolean);
  const hasImg = imgs.length > 0;
  const hasSecond = imgs.length > 1;
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isOOS = item.outOfStock;

  const handleAdd = () => {
    if (isOOS) return;
    // Only show "added" animation for items WITHOUT customization
    // Items with optionGroups open the modal instead
    if (!item.optionGroups || item.optionGroups.length === 0) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
    onSelect(item);
  };

  return (
    <div className={`animate-cardIn flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 relative group ${isOOS ? 'opacity-75' : ''}`}>
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isOOS && <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-extrabold rounded-full shadow-lg">نفذ المخزون</span>}
        {!isOOS && item.badge && <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold rounded-full shadow-lg animate-float">{item.badge}</span>}
        {!isOOS && item.featured && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[9px] font-extrabold rounded-full shadow-lg flex items-center gap-0.5 animate-glow">
            <Star className="w-2.5 h-2.5 fill-white" /> مميز
          </span>
        )}
      </div>

      {/* Image area with hover swap + slow zoom */}
      <div
        onClick={() => onViewDetail(item)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`w-full bg-gradient-to-br ${item.colorClass} flex items-center justify-center relative overflow-hidden cursor-pointer img-shine`}
        style={{ aspectRatio: '1/1' }}
      >
        {hasImg ? (
          <>
            {/* Primary image */}
            <img src={imgs[0]} alt={item.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${isOOS ? 'grayscale' : ''} ${hovered && hasSecond ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-110'}`}
              crossOrigin="anonymous" referrerPolicy="no-referrer"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              style={{ filter: isOOS ? 'grayscale(1) brightness(0.8)' : 'contrast(1.03) saturate(1.08) brightness(1.02)' }}
            />
            {/* Secondary image — appears on hover with continuous slow zoom */}
            {hasSecond && (
              <img src={imgs[1]} alt={`${item.name} - 2`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hovered ? 'opacity-100 img-slow-zoom' : 'opacity-0'}`}
                crossOrigin="anonymous" referrerPolicy="no-referrer"
                style={{ filter: isOOS ? 'grayscale(1) brightness(0.8)' : 'contrast(1.03) saturate(1.08) brightness(1.02)' }}
              />
            )}
          </>
        ) : (
          <div className={`w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center ${isOOS ? 'opacity-50' : ''}`}>
            <span className="text-2xl font-black text-white/80">{item.name.charAt(0)}</span>
          </div>
        )}

        {isOOS && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[5]">
            <span className="bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl font-ar">نفذ المخزون</span>
          </div>
        )}

        {!isOOS && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-[5]">
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-lg font-ar">
                <Eye className="w-3 h-3" /> التفاصيل
              </span>
              <div className="flex items-center gap-1">
                <a href={getShareUrl(item, window.location.href, settings.whatsappNumber)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  className="w-7 h-7 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg text-white transition-all active:scale-90 cursor-pointer">
                  <Share2 className="w-3 h-3" />
                </a>
                <button onClick={e => { e.stopPropagation(); handleAdd(); }}
                  className="w-7 h-7 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center shadow-lg text-white transition-all active:scale-90 cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {hasSecond && (
          <div className="absolute top-2 right-2 z-[6] flex gap-1">
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${!hovered ? 'bg-white shadow' : 'bg-white/40'}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${hovered ? 'bg-white shadow' : 'bg-white/40'}`} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 min-w-0">
              <h3 className={`text-[11px] sm:text-xs font-black leading-tight line-clamp-1 font-ar ${isOOS ? 'text-slate-400 line-through' : ''}`} style={{ color: isOOS ? undefined : '#5c3a1e' }}>{item.name}</h3>
              {item.nameEn && <p className="text-[9px] sm:text-[10px] line-clamp-1 leading-tight mt-0.5 font-en font-semibold italic" style={{ color: '#e97a1f' }}>{item.nameEn}</p>}
            </div>
            <div className="text-center shrink-0 price-tag bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg px-1.5 py-0.5 border border-amber-200/50">
              <span className={`text-xs sm:text-sm font-black ${isOOS ? 'text-slate-400' : 'text-gradient'}`}>{item.price.toFixed(0)}</span>
              <span className="text-[7px] text-amber-500 font-bold block leading-none">
                ر.س{item.unit ? ` / ${item.unit}` : ''}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed hidden sm:block font-ar">{item.description}</p>
          <div className="flex flex-wrap items-center gap-0.5 mt-1.5">
            {(item.orderCount || 0) > 0 && <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-bold">{getOrderCount(item.id, item.orderCount || 0)} طلب</span>}
            {item.showCalories !== false && item.calories > 0 && <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-bold">🔥 {item.calories}</span>}
            {item.dietary.slice(0, 2).map(flag => {
              const info = dietaryFilters.find(d => d.id === flag);
              if (!info) return null;
              return <span key={flag} title={info.label} className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full border font-bold inline-flex items-center gap-0.5 ${info.color}`}>{info.iconType === 'image' && info.icon ? <img src={convertUrl(info.icon)} alt="" className="w-2.5 h-2.5 object-contain rounded-sm inline" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : <span className="text-[8px]">{info.icon}</span>}{info.label}</span>;
            })}
            {item.packaging && <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200 font-bold">🎁 {item.packaging}</span>}
            {item.optionGroups && item.optionGroups.length > 0 && <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-bold">⚙️ تخصيص</span>}
          </div>
        </div>

        <button onClick={handleAdd} disabled={isOOS}
          className={`w-full mt-1 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all duration-300 text-[11px] sm:text-xs font-bold font-ar ${
            isOOS ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : added ? 'bg-green-500 text-white scale-95 cursor-pointer'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white hover:shadow-md hover:brightness-110 active:scale-[0.96] cursor-pointer'
          }`}>
          {isOOS ? '🚫 غير متوفر' : added ? <><Check className="w-3.5 h-3.5" /> <span className="animate-countUp">تمت الإضافة ✓</span></> : <><ShoppingBag className="w-3.5 h-3.5" /> أضف للسلة</>}
        </button>
      </div>
    </div>
  );
}
