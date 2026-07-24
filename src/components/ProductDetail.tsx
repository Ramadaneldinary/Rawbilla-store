import { useState } from 'react';
import { MenuItem } from '../data/menuData';
import { useApp } from '../store/AppContext';
import { X, Plus, ChevronLeft, ChevronRight, ShoppingBag, Star, Flame, Heart, Truck, Clock, Award, Share2, Users } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_TEXTS } from '../store/AppContext';
import { getOrderCount, getShareUrl } from '../utils/social';

function convertUrl(url: string): string {
  if (!url) return '';
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (m3) return `https://lh3.googleusercontent.com/d/${m3[1]}`;
  const m4 = url.match(/drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/);
  if (m4) return `https://lh3.googleusercontent.com/d/${m4[1]}`;
  return url;
}

interface ProductDetailProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: () => void;
}

export function ProductDetail({ item, onClose, onAddToCart }: ProductDetailProps) {
  const { categories, settings } = useApp();
  const T = settings.texts || DEFAULT_TEXTS;
  const dietaryFilters = (settings.dietaryFilters || []).filter(d => d.enabled);
  const [liked, setLiked] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const resolvedImages = (item.images || []).map(convertUrl).filter(Boolean);
  const hasImages = resolvedImages.length > 0;
  // Start from 2nd image if available (1st is shown in card, 2nd is the "detail" view)
  const [currentImageIdx, setCurrentImageIdx] = useState(resolvedImages.length > 1 ? 1 : 0);
  const cat = categories.find(c => c.id === item.category);

  const nextImage = () => setCurrentImageIdx(prev => (prev + 1) % resolvedImages.length);
  const prevImage = () => setCurrentImageIdx(prev => (prev - 1 + resolvedImages.length) % resolvedImages.length);

  const handleAdd = () => {
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 800);
    onAddToCart();
  };

  // Label images
  const imageLabels = ['الصورة الرئيسية', 'صورة التغليف', 'صورة من الداخل', 'صورة إضافية'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-scaleIn">

        {/* ═══ Image Hero Section ═══ */}
        <div className={`relative w-full bg-gradient-to-br ${item.colorClass} flex items-center justify-center overflow-hidden shrink-0`} style={{ aspectRatio: '1/1', maxHeight: '50vh' }}>
          {hasImages ? (
            <>
              <img src={resolvedImages[currentImageIdx]} alt={item.name}
                className="w-full h-full object-cover transition-all duration-500"
                crossOrigin="anonymous" referrerPolicy="no-referrer"
                style={{ imageRendering: 'auto', filter: 'contrast(1.03) saturate(1.08) brightness(1.02)' }} />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

              {resolvedImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer transition backdrop-blur-sm"><ChevronLeft className="w-5 h-5 text-slate-700" /></button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer transition backdrop-blur-sm"><ChevronRight className="w-5 h-5 text-slate-700" /></button>
                  {/* Image indicator with label */}
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {resolvedImages.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImageIdx(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${i === currentImageIdx ? 'bg-white w-6 shadow' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    📸 {imageLabels[currentImageIdx] || `صورة ${currentImageIdx + 1}`} ({currentImageIdx + 1}/{resolvedImages.length})
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center">
                <span className="text-4xl font-black text-white/60">{item.name.charAt(0)}</span>
              </div>
              <span className="text-white/60 text-xs font-bold bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">لا توجد صور حالياً</span>
            </div>
          )}

          {/* Top buttons */}
          <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer transition z-10 backdrop-blur-sm"><X className="w-5 h-5 text-slate-700" /></button>
          <button onClick={() => setLiked(!liked)} className="absolute top-3 left-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer transition z-10 backdrop-blur-sm">
            <Heart className={`w-5 h-5 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500 scale-125' : 'text-slate-400'}`} />
          </button>

          {/* Badges overlay */}
          <div className="absolute top-3 left-16 flex items-center gap-2 z-10">
            {item.badge && <span className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full shadow-lg">{item.badge}</span>}
            {item.featured && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-extrabold rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> مميز
              </span>
            )}
          </div>
        </div>

        {/* ═══ Content ═══ */}
        <div className="flex-1 overflow-y-auto">
          {/* Price & Name Block */}
          <div className="p-5 pb-3 bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-black leading-tight font-ar" style={{ color: '#5c3a1e' }}>{item.name}</h2>
                {item.nameEn && (
                  <p className="text-sm mt-0.5 font-en font-semibold italic" style={{ color: '#e97a1f' }}>{item.nameEn}</p>
                )}
                {cat && (
                  <span className="text-xs text-slate-400 font-bold mt-1.5 flex items-center gap-1.5">
                    {cat.displayMode === 'image-only' && (cat.emojiType === 'image' || /^https?:\/\//i.test(cat.emoji || '')) && cat.emoji ? (
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                        <img src={convertUrl(cat.emoji)} alt={cat.name} title={cat.name} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <><CategoryIcon cat={cat} size={16} /> {cat.name}</>
                    )}
                  </span>
                )}
              </div>
              <div className="text-center shrink-0 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3">
                {item.outOfStock && <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 block mb-1">نفذ المخزون</span>}
                <span className={`text-2xl font-black block ${item.outOfStock ? 'text-slate-400 line-through' : 'text-amber-600'}`}>{item.price.toFixed(0)}</span>
                <span className="text-[10px] font-bold text-amber-500">ر.س</span>
                {item.unit && <span className="text-[10px] font-bold text-amber-700 block mt-0.5">لكل {item.unit}</span>}
              </div>
            </div>
            {/* Unit & Packaging & OutOfStock tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {item.outOfStock && <span className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full border border-red-200 font-black flex items-center gap-1">🚫 غير متوفر حالياً</span>}
              {item.unit && <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 font-bold flex items-center gap-1">⚖️ الوحدة: {item.unit}</span>}
              {item.packaging && <span className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200 font-bold flex items-center gap-1">🎁 التعبئة: {item.packaging}</span>}
            </div>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-4">
            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">
              {item.description}
            </p>

            {/* Quick Info Chips (dynamic) */}
            <div className="flex flex-wrap gap-2">
              {item.showCalories !== false && item.calories > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 rounded-xl border border-orange-100">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{item.calories} سعرة</span>
                </div>
              )}
              {item.showPrepTime !== false && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">{item.prepTime || '٥-١٥ دقيقة'}</span>
                </div>
              )}
              {item.showQuality !== false && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 rounded-xl border border-purple-100">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-purple-700">{item.qualityLabel || 'جودة فاخرة'}</span>
                </div>
              )}
              {item.optionGroups && item.optionGroups.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-700">قابل للتخصيص</span>
                </div>
              )}
            </div>

            {/* Dietary Badges */}
            {item.dietary.length > 0 && (
              <div>
                <h4 className="text-[11px] font-black text-slate-500 mb-2 tracking-wider">المعلومات الغذائية</h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.dietary.map(flag => {
                    const info = dietaryFilters.find(d => d.id === flag);
                    if (!info) return null;
                    return <span key={flag} className={`text-xs px-3 py-1.5 rounded-full border font-bold inline-flex items-center gap-1 ${info.color}`}>{info.iconType === 'image' && info.icon ? <img src={convertUrl(info.icon)} alt="" className="w-4 h-4 object-contain rounded-sm" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : <span>{info.icon}</span>} {info.label}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Image Gallery Thumbnails */}
            {hasImages && resolvedImages.length > 1 && (
              <div>
                <h4 className="text-[11px] font-black text-slate-500 mb-2 tracking-wider">📷 معرض الصور</h4>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {resolvedImages.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImageIdx(i)}
                      className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        i === currentImageIdx
                          ? 'border-amber-500 shadow-lg shadow-amber-100 scale-105 w-24 h-24'
                          : 'border-slate-200 opacity-70 hover:opacity-100 w-20 h-20'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  {resolvedImages.map((_, i) => (
                    <span key={i} className="text-[9px] text-slate-400 font-medium">
                      {i > 0 && '·'} {imageLabels[i] || `صورة ${i+1}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Free Delivery Motivator */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-green-800">🎉 توصيل مجاني للطلبات فوق {settings.freeDeliveryThreshold ?? 200} ر.س</p>
                <p className="text-[10px] text-green-600 font-medium mt-0.5">اطلب أكثر ووفّر رسوم التوصيل!</p>
              </div>
            </div>

            {/* Order Counter + Share */}
            <div className="flex gap-2">
              {/* Live order counter */}
              <div className="flex-1 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-3 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-800">
                    طُلب <span className="text-amber-600 text-sm">{getOrderCount(item.id, item.orderCount || 0)}</span> مرة
                  </p>
                  <p className="text-[10px] text-amber-600 font-medium">{T.productPopularText}</p>
                </div>
              </div>

              {/* Share button */}
              <a href={getShareUrl(item, window.location.href, settings)} target="_blank" rel="noopener noreferrer"
                className="shrink-0 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex flex-col items-center justify-center gap-1 text-white shadow-md hover:shadow-lg active:scale-95 transition cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span className="text-[8px] font-bold">شارك</span>
              </a>
            </div>
          </div>
        </div>

        {/* ═══ Sticky Add to Cart ═══ */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button onClick={item.outOfStock ? undefined : handleAdd} disabled={item.outOfStock}
            className={`w-full py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 text-base font-black ${
              item.outOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : addedAnim
                  ? 'bg-green-500 text-white scale-95 cursor-pointer'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.97] text-white cursor-pointer'
            }`}>
            {item.outOfStock ? (
              <span>🚫 غير متوفر حالياً</span>
            ) : addedAnim ? (
              <><span className="text-lg">✓</span> تمت الإضافة!</>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> أضف للسلة — {item.price.toFixed(2)} ر.س{item.unit ? ` / ${item.unit}` : ''}</>
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400 font-medium mt-2">
            🔒 طلب آمن • 🚚 توصيل سريع • ⭐ ضمان الجودة
          </p>
        </div>
      </div>
    </div>
  );
}
