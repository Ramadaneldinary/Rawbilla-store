import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MenuItem } from './data/menuData';
import { useApp, DEFAULT_TEXTS } from './store/AppContext';
import { Logo, FooterLogo, convertDriveUrl as cvtUrl } from './components/Logo';
import { CategoryIcon } from './components/CategoryIcon';
import { MenuCard } from './components/MenuCard';
import { CustomizationModal } from './components/CustomizationModal';
import { CartSidebar } from './components/CartSidebar';
import { ProductDetail } from './components/ProductDetail';
import { AdminPanel } from './components/AdminPanel';
import { Search, ShoppingBag, X, SlidersHorizontal, Sparkles, Filter, Shield, Lock, Star, Plus, Loader2 } from 'lucide-react';
import { ContactButton } from './components/ContactButton';
import { FlashDeals } from './components/FlashDeals';

function cvtImg(url: string): string {
  if (!url) return '';
  const driveRegexes = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?.*id=([^&]+)/,
    /drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/
  ];

  for (const regex of driveRegexes) {
    const match = url.match(regex);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

/* ═══ Auto-scrolling Infinite Carousel ═══ */
interface FeaturedCarouselProps {
  items: MenuItem[];
  categories: { id: string; name: string }[];
  title: string;
  subtitle?: string;
  countLabel: string;
  onView: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
}

function FeaturedCarousel({ items, categories: cats, title, subtitle, countLabel, onView, onAdd }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  const loopItems = useMemo(() => (isMobile ? items : [...items, ...items, ...items]), [items, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const el = scrollRef.current;
    if (!el || items.length < 2) return;

    const cardW = 256 + 16; 
    const setW = items.length * cardW;
    el.scrollLeft = setW;

    const interval = setInterval(() => {
      if (!pausedRef.current && el) {
        el.scrollLeft += 1;
        if (el.scrollLeft >= setW * 2) el.scrollLeft = setW;
        if (el.scrollLeft <= 0) el.scrollLeft = setW;
      }
    }, 20);

    return () => clearInterval(interval);
  }, [items.length, isMobile]);

  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => { pausedRef.current = false; }, []);

  const renderCard = (item: MenuItem, key: string) => (
    <div key={key} className="w-56 sm:w-64 shrink-0 group">
      <div 
        onClick={() => onView(item)} 
        className={`bg-gradient-to-br ${item.colorClass || 'from-amber-50 to-orange-50'} rounded-3xl flex items-center justify-center relative overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 img-shine`} 
        style={{ aspectRatio: '1/1' }}
      >
        {item.images?.length ? (
          <img 
            src={cvtImg(item.images[0])} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer" 
            style={{ filter: 'contrast(1.03) saturate(1.08) brightness(1.02)' }} 
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-2xl font-black text-white/70">{item.name.charAt(0)}</span>
          </div>
        )}
        
        {item.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold rounded-full shadow-lg">
            {item.badge}
          </span>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-base font-black text-white drop-shadow-lg line-clamp-1 font-ar">{item.name}</h4>
          {item.nameEn && <p className="text-[10px] font-semibold italic line-clamp-1 font-en" style={{ color: '#fbbf24' }}>{item.nameEn}</p>}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-white/80 font-medium">{cats.find(c => c.id === item.category)?.name}</span>
            <span className="text-base font-black text-white bg-amber-500/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow">{item.price} ر.س</span>
          </div>
        </div>
        
        <button 
          onClick={e => { e.stopPropagation(); onAdd(item); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-amber-600 hover:scale-110 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Star className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">{countLabel}</span>
      </div>
      
      <div 
        ref={scrollRef}
        onMouseEnter={pause} 
        onMouseLeave={resume}
        onTouchStart={pause} 
        onTouchEnd={() => setTimeout(resume, 3000)}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none" 
        style={{ scrollBehavior: 'auto' }}
      >
        {loopItems.map((item, idx) => renderCard(item, `${item.id}-${idx}`))}
      </div>
    </div>
  );
}

/* ═══ Main App Component ═══ */
export default function App() {
  const ctx = useApp();
  const { categories, menuItems, cart, isAdmin, login, addToCart, settings, featuredItems, loading } = ctx;
  
  const activeDietaryFilters = useMemo(() => (settings?.dietaryFilters || []).filter(d => d.enabled), [settings?.dietaryFilters]);
  const featuredCfg = settings?.featured || { title: '', subtitle: '', enabled: true, itemIds: [], style: 'scroll' as const };
  const T = settings?.texts || DEFAULT_TEXTS;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [catAnim, setCatAnim] = useState<string | null>(null);

  // حماية صارمة لمنع الوميض: نتحقق هنا محلياً من وصول البيانات بشكل حقيقي وتخطي أي قيم كاش أو قيم افتراضية قديمة
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // نتحقق أن الـ loading في التطبيق انتهى، وأن الـ settings حقيقية وليست مساوية للقيم الافتراضية الأولية فقط
    if (!loading && settings && settings.texts && settings.texts.heroTitle !== DEFAULT_TEXTS.heroTitle) {
      setIsReady(true);
    } else if (!loading && settings) {
      // كخيار احتياطي إذا كان المستخدم لم يغير العنوان الافتراضي، ننتظر نصف ثانية للاستقرار الكامل
      const fallbackTimer = setTimeout(() => setIsReady(true), 600);
      return () => clearTimeout(fallbackTimer);
    }
  }, [loading, settings]);

  const handleSelectItem = useCallback((item: MenuItem) => { 
    if (item.optionGroups && item.optionGroups.length > 0) {
      setCustomizingItem(item); 
    } else {
      addToCart(item, []); 
    }
  }, [addToCart]);

  const handleViewDetail = useCallback((item: MenuItem) => setDetailItem(item), []);
  
  const toggleDietary = useCallback((id: string) => {
    setSelectedDietary(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }, []);

  const handleCatClick = useCallback((catId: string) => {
    setCatAnim(catId);
    setActiveCategory(catId);
    setTimeout(() => setCatAnim(null), 400);
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (item.hidden) return false;
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesDietary = item.dietary?.some(dd => 
          activeDietaryFilters.find(f => f.id === dd)?.label.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDesc && !matchesDietary) return false;
      }
      
      if (selectedDietary.length > 0 && !selectedDietary.every(f => item.dietary?.includes(f))) return false;
      return true;
    });
  }, [menuItems, activeCategory, searchQuery, selectedDietary, activeDietaryFilters]);

  const handleAdminLogin = useCallback(() => { 
    if (login(adminCode)) { 
      setShowAdminLogin(false); 
      setShowAdminPanel(true); 
      setAdminCode(''); 
      setLoginError(''); 
    } else {
      setLoginError('رمز الدخول غير صحيح'); 
    }
  }, [login, adminCode]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // إخفاء المتجر بالكامل خلف شاشة التحميل لمنع الوميض نهائياً لحين جلب إعدادات لوحة التحكم
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-500 tracking-wide animate-pulse">... جاري جلب البيانات</p>
      </div>
    );
  }

  const renderCatBtn = (cat: typeof categories[0]) => {
    const mode = cat.displayMode || 'image-name';
    const hasImg = (cat.emojiType === 'image' || /^https?:\/\//i.test(cat.emoji || '') || /drive\.google\.com/i.test(cat.emoji || '')) && cat.emoji;
    const isImgOnly = mode === 'image-only';
    const isSelected = activeCategory === cat.id;
    const isAnimating = catAnim === cat.id;

    return (
      <button 
        key={cat.id} 
        onClick={() => handleCatClick(cat.id)} 
        title={cat.name || ''}
        className={`cat-card flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${
          isAnimating ? (isSelected ? 'cat-btn-selected' : 'cat-btn-press') : ''
        } ${isSelected
          ? 'cat-card-active bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500 text-white shadow-xl shadow-amber-200/50'
          : 'bg-white/90 glass border-slate-200/60 text-slate-700 hover:shadow-xl shadow-sm active:scale-95'
        }`}
        style={isImgOnly && hasImg ? { width: 68, height: 68, padding: 5 } : { padding: '10px 16px' }}
      >
        {isImgOnly && hasImg && (
          <div className={`cat-img-wrap w-full h-full ${isSelected ? 'ring-2 ring-white/60 rounded-2xl' : ''}`}>
            <img src={cvtUrl(cat.emoji)} alt={cat.name} className="w-full h-full object-cover rounded-xl" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          </div>
        )}
        {isImgOnly && !hasImg && <span className="text-xs font-bold">{cat.name || 'تصنيف'}</span>}

        {mode === 'image-name' && hasImg && (
          <div className={`cat-img-wrap mb-1.5 ${isSelected ? 'ring-2 ring-white/40 rounded-xl' : ''}`} style={{ width: 42, height: 42 }}>
            <img src={cvtUrl(cat.emoji)} alt={cat.name} className="w-full h-full object-cover rounded-xl" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          </div>
        )}
        {mode === 'image-name' && !hasImg && <div className="mb-1"><CategoryIcon cat={cat} size={30} /></div>}
        {mode === 'image-name' && cat.name && (
          <span className={`cat-name-label text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>{cat.name}</span>
        )}

        {mode === 'name-only' && (
          <span className={`cat-name-label text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{cat.name}</span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans select-none overflow-x-hidden antialiased animate-fadeIn">
      {/* الهيدر */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-100/80 shadow-sm" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <Logo size="md" />
          <div className="flex-1 max-w-lg hidden md:flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 focus-within:border-amber-400 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={T.searchPlaceholder}
              className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1 cursor-pointer"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => isAdmin ? setShowAdminPanel(true) : setShowAdminLogin(true)} className={`p-2.5 rounded-2xl border transition cursor-pointer ${isAdmin ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100'}`}><Shield className="w-4 h-4" /></button>
            <button onClick={() => setIsCartOpen(!isCartOpen)} className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition cursor-pointer">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">{cartCount}</span>}
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 md:hidden">
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={T.searchPlaceholder}
              className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1 cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>}
          </div>
        </div>
      </header>

      {/* بطاقة موظف المبيعات */}
      {settings?.salesRep?.enabled && settings.salesRep.name && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {settings.salesRep.photoUrl && (
                <img src={cvtUrl(settings.salesRep.photoUrl)} alt={settings.salesRep.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/40 shadow-md shrink-0"
                  crossOrigin="anonymous" referrerPolicy="no-referrer" />
              )}
              <div>
                <p className="text-sm font-black leading-tight">{settings.salesRep.name}</p>
                {settings.salesRep.title && <p className="text-[10px] text-white/80 font-medium">{settings.salesRep.title}</p>}
              </div>
            </div>
            {settings.salesRep.phone && (
              <ContactButton phone={settings.salesRep.phone} label="تواصل معي" size="sm" texts={{ title: T.contactTitle, whatsapp: T.contactWhatsApp, whatsappHint: T.contactWhatsAppHint, call: T.contactCall, callHint: T.contactCallHint }} showDesignRequest />
            )}
          </div>
        </div>
      )}

      {/* البانر الرئيسي */}
      <div className={`relative border-b border-slate-100/60 overflow-hidden ${settings?.heroBgEnabled === false ? 'bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-50/40' : ''}`} style={{ minHeight: 140 }}>
        {settings?.heroBgEnabled !== false && (
          <>
            {settings?.heroBgUrl ? (
              <img src={cvtUrl(settings.heroBgUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            ) : (
              <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-amber-50/85" />
          </>
        )}
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-12"><Sparkles className="w-48 h-48 text-amber-300" /></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
          <span className="inline-block text-[10px] bg-white/70 text-amber-700 font-extrabold px-3 py-1.5 rounded-full border border-amber-300/40 tracking-wider backdrop-blur-sm shadow-sm">{T.menuTitle}</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-3 leading-tight tracking-tight drop-shadow-sm">
            {T.heroTitle}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-2 max-w-lg">{T.heroSubtitle}</p>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-sm">
              <span className="text-[10px] font-bold text-slate-700">{menuItems.length} صنف</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-sm">
              <span className="text-sm">📂</span>
              <span className="text-[10px] font-bold text-slate-700">{categories.length} تصنيف</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-sm">
              <span className="text-sm">🚚</span>
              <span className="text-[10px] font-bold text-green-700">توصيل مجاني +200</span>
            </div>
          </div>
        </div>
      </div>

      {/* القسم المميز */}
      {featuredCfg.enabled && featuredItems && featuredItems.length > 0 && activeCategory === 'all' && !searchQuery && (
        <FeaturedCarousel items={featuredItems} categories={categories} title={featuredCfg.title || 'الأصناف المميزة'} subtitle={featuredCfg.subtitle} countLabel={`${featuredItems.length} ${T.featuredCountLabel || 'طبق'}`} onView={handleViewDetail} onAdd={handleSelectItem} />
      )}

      {/* العروض المحدودة */}
      <FlashDeals />

      {/* المحتوى الرئيسي للمنيو */}
      <div className={`flex-1 relative ${settings?.contentBgEnabled === false ? 'bg-slate-50/60' : ''}`}>
        {settings?.contentBgEnabled !== false && (
          <div className="absolute inset-0 pointer-events-none">
            {settings?.contentBgUrl ? (
              <img src={cvtUrl(settings.contentBgUrl)} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            ) : (
              <img src="/images/pattern-bg.jpg" alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-white/80" />
          </div>
        )}

        <div className="relative max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <span className="text-sm font-black text-slate-700 flex items-center gap-2"><Filter className="w-4 h-4 text-amber-500" /> {T.categoriesLabel}</span>
                {selectedDietary.length > 0 && <button onClick={() => setSelectedDietary([])} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer">مسح الفلاتر</button>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => handleCatClick('all')}
                  className={`cat-card flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer ${catAnim === 'all' ? 'cat-btn-press' : ''} ${
                    activeCategory === 'all'
                      ? 'cat-card-active bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500 text-white shadow-xl shadow-amber-200/50'
                      : 'bg-white/90 glass border-slate-200/60 text-slate-700 hover:shadow-xl shadow-sm active:scale-95'
                  }`}>
                  <span className="cat-name-label">🍴 الكل</span>
                </button>
                {categories.map(renderCatBtn)}
              </div>
              {activeDietaryFilters.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-50">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5" /> فلاتر غذائية</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">{activeDietaryFilters.map(diet => {
                    const checked = selectedDietary.includes(diet.id);
                    return <button key={diet.id} onClick={() => toggleDietary(diet.id)} className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1 font-bold transition cursor-pointer ${checked ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400 text-amber-800' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                      {diet.iconType === 'image' && diet.icon ? <img src={cvtUrl(diet.icon)} alt="" className="w-3.5 h-3.5 object-contain rounded-sm" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : <span>{diet.icon}</span>} {diet.label}
                    </button>;
                  })}</div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-100 pb-2">
              <span className="flex items-center gap-1.5">📦 عرض <span className="text-amber-600 font-black text-sm">{filteredItems.length}</span> منتج</span>
              {activeCategory !== 'all' && <span className="text-amber-600 font-extrabold bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5">{categories.find(c => c.id === activeCategory)?.name}</span>}
            </div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 px-6 bg-white border border-slate-100 rounded-3xl"><span className="text-4xl">🥘</span><h3 className="text-base font-bold text-slate-800 mt-2">لا توجد نتائج</h3><p className="text-xs text-slate-400 mt-1">جرّب تغيير الفلاتر أو كلمات البحث</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 stagger-grid">{filteredItems.map(item => <MenuCard key={item.id} item={item} onSelect={handleSelectItem} onViewDetail={handleViewDetail} />)}</div>
            )}
          </div>
        </div>
      </div>

      {/* سلة الطلب */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" />
        <div className={`absolute right-0 top-0 bottom-0 max-w-sm w-full bg-white transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}><CartSidebar onClose={() => setIsCartOpen(false)} /></div>
      </div>
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button onClick={() => setIsCartOpen(true)}
            className="cart-float-btn flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-black px-5 py-3.5 rounded-full cursor-pointer text-sm shadow-xl transition-transform hover:scale-105 active:scale-95">
            <ShoppingBag className="w-5 h-5" /> سلتي ({cartCount})
          </button>
        </div>
      )}

      {/* النوافذ والـ Modals */}
      {detailItem && <ProductDetail item={detailItem} onClose={() => setDetailItem(null)} onAddToCart={() => {
        if (detailItem.optionGroups && detailItem.optionGroups.length > 0) {
          setCustomizingItem(detailItem);
          setDetailItem(null);
        } else {
          addToCart(detailItem, []);
          setDetailItem(null);
        }
      }} />}
      {customizingItem && <CustomizationModal item={customizingItem} onClose={() => setCustomizingItem(null)} onConfirm={opts => { addToCart(customizingItem, opts); setCustomizingItem(null); }} />}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 flex flex-col gap-4 animate-scaleIn border border-slate-100">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Lock className="w-5 h-5 text-amber-500" /><h3 className="text-base font-black text-slate-800">دخول الأدمن</h3></div><button onClick={() => { setShowAdminLogin(false); setLoginError(''); setAdminCode(''); }} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"><X className="w-5 h-5" /></button></div>
            <input type="password" value={adminCode} onChange={e => { setAdminCode(e.target.value); setLoginError(''); }} placeholder="الرمز السري" onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500 text-center tracking-[0.3em] font-bold" />
            {loginError && <p className="text-xs text-red-500 font-bold text-center">{loginError}</p>}
            <button onClick={handleAdminLogin} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-2xl shadow-md cursor-pointer text-sm">تسجيل الدخول</button>
          </div>
        </div>
      )}
      {showAdminPanel && isAdmin && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

      {/* الفوتر */}
      <footer className={`relative border-t border-amber-200/30 overflow-hidden ${settings?.footerBgEnabled === false ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100' : ''}`}>
        {settings?.footerBgEnabled !== false && (
          <div className="absolute inset-0 pointer-events-none">
            {settings?.footerBgUrl ? (
              <img src={cvtUrl(settings.footerBgUrl)} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            ) : settings?.contentBgUrl ? (
              <img src={cvtUrl(settings.contentBgUrl)} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            ) : (
              <img src="/images/pattern-bg.jpg" alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-white/70" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 py-10 px-4 md:px-6">
          {settings?.footerLogoUrl ? (
            <img src={cvtUrl(settings.footerLogoUrl)} alt="" className="h-14 max-w-[180px] object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          ) : settings?.headerBrandImgUrl ? (
            <img src={cvtUrl(settings.headerBrandImgUrl)} alt="" className="h-12 max-w-[160px] object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          ) : (
            <FooterLogo />
          )}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 text-xs font-bold" style={{ color: '#92400e' }}>
              <span>© {new Date().getFullYear()} {T.footerBrandName || 'RAWBILLA'}</span><span>•</span><span>{T.footerCopyright || 'جميع الحقوق محفوظة'}</span>
            </div>
            <p className="text-[10px] font-medium" style={{ color: '#b45309' }}>{T.footerTagline}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <span className="text-[9px] px-2.5 py-1 bg-white/60 rounded-full border border-amber-200/50 font-bold text-amber-800 shadow-sm">{T.footerBadge1 || 'طلب آمن'}</span>
              <span className="text-[9px] px-2.5 py-1 bg-white/60 rounded-full border border-amber-200/50 font-bold text-amber-800 shadow-sm">{T.footerBadge2 || 'توصيل سريع'}</span>
              <span className="text-[9px] px-2.5 py-1 bg-white/60 rounded-full border border-amber-200/50 font-bold text-amber-800 shadow-sm">{T.footerBadge3 || 'ضمان الجودة'}</span>
            </div>
          </div>
          <ContactButton phone={settings?.whatsappNumber} label={T.footerContactBtn || 'تواصل معنا'} size="md"
            texts={{ title: T.contactTitle, whatsapp: T.contactWhatsApp, whatsappHint: T.contactWhatsAppHint, call: T.contactCall, callHint: T.contactCallHint }}
            showDesignRequest
          />
        </div>
      </footer>
    </div>
  );
}
