import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Category, MenuItem, OptionItem, DietaryFilter, DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_DIETARY_FILTERS } from '../data/menuData';
import { calcUnitPrice } from '../utils/price';
import { incrementOrderCount } from '../utils/social';

/* ───── Cart Item ───── */
export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedOptions: OptionItem[];
  quantity: number;
  notes: string;
}

/* ───── Discount Tier ───── */
export interface DiscountTier {
  id: string;
  minItems: number;
  minValue?: number;        // minimum order value (SAR) — alternative to minItems
  discountType?: 'items' | 'value';  // default = 'items'
  discountPercent: number;
  label: string;
  visible: boolean;
}

const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { id: 'tier-1', minItems: 5,  discountPercent: 5,  label: 'برونزي',  visible: true },
  { id: 'tier-2', minItems: 10, discountPercent: 10, label: 'فضي',    visible: true },
  { id: 'tier-3', minItems: 15, discountPercent: 15, label: 'ذهبي',   visible: true },
  { id: 'tier-4', minItems: 20, discountPercent: 20, label: 'بلاتيني', visible: true },
];

/* ───── Featured Section Config ───── */
export interface FeaturedConfig {
  title: string;
  subtitle: string;
  enabled: boolean;
  itemIds: string[];       // ordered list of featured item IDs
  style: 'scroll' | 'grid';
}

const DEFAULT_FEATURED: FeaturedConfig = {
  title: 'الأطباق المميزة',
  subtitle: 'اكتشف أشهى اختياراتنا المختارة بعناية',
  enabled: true,
  itemIds: [],  // empty = use item.featured flag as fallback
  style: 'scroll',
};

/* ───── Customizable Texts ───── */
export interface CustomTexts {
  menuTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  categoriesLabel: string;
  footerTagline: string;
  productPopularText: string;
  featuredCountLabel: string;
  cartEmptyText: string;
  cartEmptyHint: string;
  discountHint: string;
  notePlaceholder: string;
  footerCopyright: string;
  footerBadge1: string;
  footerBadge2: string;
  footerBadge3: string;
  footerContactBtn: string;
  footerBrandName: string;
  contactTitle: string;      // عنوان قائمة التواصل
  contactWhatsApp: string;   // نص واتساب
  contactWhatsAppHint: string;
  contactCall: string;       // نص اتصال
  contactCallHint: string;
  cartTitle: string;
  cartSubtotal: string;
  cartTax: string;
  cartTotal: string;
  cartCheckoutBtn: string;
  cartNoteBtn: string;
  cartSendBtn: string;
  cartBackBtn: string;
  cartOrderInfo: string;
  discountValueHint: string;  // "اطلب بقيمة {val} ر.س واحصل على خصم {pct}%"
  discountNextLabel: string;  // "القادم"
  discountReachedMsg: string; // "مبروك! وصلت لأعلى مستوى"
  discountSavedMsg: string;   // "وفّرت"
}

const DEFAULT_TEXTS: CustomTexts = {
  menuTitle: 'قائمة الطعام',
  heroTitle: 'اكتشف أطباقنا المميزة',
  heroSubtitle: 'اختر من تشكيلتنا الفاخرة، خصّص طلبك، وأرسله مباشرة عبر واتساب',
  searchPlaceholder: 'ابحث عن أطباق أو تصنيفات...',
  categoriesLabel: 'التصنيفات',
  footerTagline: 'صُنع من شغف لعشّاق الحلويات والشوكولا',
  productPopularText: 'من أكثر الأطباق طلباً هذا الأسبوع',
  featuredCountLabel: 'طبق',
  cartEmptyText: 'السلة فارغة',
  cartEmptyHint: 'اكتشف قائمتنا وأضف أطباقك المفضلة',
  discountHint: 'أضف {qty} قطع للحصول على خصم {pct}%',
  notePlaceholder: 'مثال: حار جداً، بدون بصل...',
  footerCopyright: 'جميع الحقوق محفوظة',
  footerBadge1: 'طلب آمن',
  footerBadge2: 'توصيل سريع',
  footerBadge3: 'ضمان الجودة',
  footerContactBtn: 'تواصل معنا',
  footerBrandName: 'PerfectChef',
  contactTitle: 'اختر طريقة التواصل',
  contactWhatsApp: 'واتساب',
  contactWhatsAppHint: 'إرسال رسالة فورية',
  contactCall: 'اتصال مباشر',
  contactCallHint: 'اتصل الآن',
  cartTitle: 'سلة الطلب',
  cartSubtotal: 'المجموع',
  cartTax: 'الضريبة (15%)',
  cartTotal: 'الإجمالي',
  cartCheckoutBtn: 'إتمام الطلب عبر واتساب',
  cartNoteBtn: 'ملاحظة',
  cartSendBtn: 'إرسال الطلب عبر واتساب',
  cartBackBtn: 'رجوع',
  cartOrderInfo: 'معلومات الطلب',
  discountValueHint: 'اطلب بقيمة {val} ر.س واحصل على خصم {pct}%',
  discountNextLabel: 'القادم',
  discountReachedMsg: 'مبروك! وصلت لأعلى مستوى',
  discountSavedMsg: 'وفّرت',
};

/* ───── Sales Rep Card ───── */
export interface SalesRepConfig {
  enabled: boolean;
  name: string;
  title: string;       // e.g. "مستشار المبيعات"
  phone: string;
  photoUrl: string;
}

/* ───── Store Settings ───── */
export interface StoreSettings {
  logoUrl: string;
  whatsappNumber: string;
  discountTiers: DiscountTier[];
  discountEnabled: boolean;
  dietaryFilters: DietaryFilter[];
  featured: FeaturedConfig;
  texts: CustomTexts;
  salesRep: SalesRepConfig;
  heroBgUrl: string;
  heroBgEnabled: boolean;
  contentBgUrl: string;
  contentBgEnabled: boolean;
  footerBgUrl: string;
  footerBgEnabled: boolean;
  footerLogoUrl: string;
  headerBrandImgUrl: string;
  brandText: string;
  brandTextColor: string;
  brandImgSize: number;
  brandFont: string;
  // Flash Deals
  flashDeals: { enabled: boolean; items: { itemId: string; oldPrice: number; newPrice: number; endsAt: string }[] };

  // Smart Recommendations
  recommendations: { enabled: boolean; title: string };
}

export { DEFAULT_TEXTS };

/* ───── Discount Calculation Result ───── */
export interface DiscountResult {
  totalItems: number;
  currentTier: DiscountTier | null;
  nextTier: DiscountTier | null;
  discountPercent: number;
  discountAmount: number;
  progressToNext: number;
  itemsToNextTier: number;
}

/* ───── Context Type ───── */
interface AppState {
  isAdmin: boolean;
  login: (code: string) => boolean;
  logout: () => void;

  categories: Category[];
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem, options: OptionItem[]) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  updateCartNotes: (id: string, notes: string) => void;
  clearCart: () => void;

  settings: StoreSettings;
  updateSettings: (s: Partial<StoreSettings>) => void;

  /** Batch replace all data at once */
  replaceCategories: (cats: Category[]) => void;
  replaceMenuItems: (items: MenuItem[]) => void;

  /** Resolved featured items in correct order */
  featuredItems: MenuItem[];

  discountResult: DiscountResult;
  sendWhatsAppOrder: (deliveryMethod: string, name: string, phone: string, address: string) => void;
}

const AppContext = createContext<AppState | null>(null);
const ADMIN_CODE = 'MOD13';

const LS_KEY_CATS = 'pc_categories';
const LS_KEY_ITEMS = 'pc_menuItems';
const LS_KEY_SETTINGS = 'pc_settings_v3';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>(() => loadJSON(LS_KEY_CATS, DEFAULT_CATEGORIES));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadJSON(LS_KEY_ITEMS, DEFAULT_MENU_ITEMS));
  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadJSON(LS_KEY_SETTINGS, {
      logoUrl: '', whatsappNumber: '966531254475',
      discountTiers: DEFAULT_DISCOUNT_TIERS, discountEnabled: true,
      dietaryFilters: DEFAULT_DIETARY_FILTERS,
      featured: DEFAULT_FEATURED,
      texts: DEFAULT_TEXTS,
      salesRep: { enabled: false, name: '', title: '', phone: '', photoUrl: '' },
      heroBgUrl: '',
      heroBgEnabled: true,
      contentBgUrl: '',
      contentBgEnabled: true,
      footerBgUrl: '',
      footerBgEnabled: true,
      footerLogoUrl: '',
      headerBrandImgUrl: '',
      brandText: '',
      brandTextColor: '#5c3a1e',
      brandImgSize: 48,
      brandFont: '',
      flashDeals: { enabled: false, items: [] },

      recommendations: { enabled: true, title: 'قد يعجبك أيضاً' },
    })
  );
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => { localStorage.setItem(LS_KEY_CATS, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(LS_KEY_ITEMS, JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(settings)); }, [settings]);

  const login = (code: string) => { if (code === ADMIN_CODE) { setIsAdmin(true); return true; } return false; };
  const logout = () => setIsAdmin(false);

  const addCategory = (cat: Category) => setCategories(prev => [...prev, cat]);
  const updateCategory = (id: string, patch: Partial<Category>) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const deleteCategory = (id: string) => { setCategories(prev => prev.filter(c => c.id !== id)); setMenuItems(prev => prev.filter(m => m.category !== id)); };

  const addMenuItem = (item: MenuItem) => setMenuItems(prev => [...prev, item]);
  const updateMenuItem = (id: string, patch: Partial<MenuItem>) => setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  const deleteMenuItem = (id: string) => setMenuItems(prev => prev.filter(m => m.id !== id));

  /** Batch replace — for import */
  const replaceCategories = (cats: Category[]) => setCategories(cats);
  const replaceMenuItems = (items: MenuItem[]) => setMenuItems(items);

  const addToCart = (item: MenuItem, selectedOptions: OptionItem[]) => {
    // Increment order counter
    incrementOrderCount(item.id, item.orderCount || 0);
    setCart(prev => {
      const dup = prev.findIndex(ci => {
        if (ci.menuItem.id !== item.id) return false;
        if (ci.selectedOptions.length !== selectedOptions.length) return false;
        return ci.selectedOptions.every(o => selectedOptions.some(s => s.id === o.id));
      });
      if (dup !== -1) { const u = [...prev]; u[dup] = { ...u[dup], quantity: u[dup].quantity + 1 }; return u; }
      return [...prev, { id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, menuItem: item, selectedOptions, quantity: 1, notes: '' }];
    });
  };
  const updateCartQuantity = (id: string, delta: number) => setCart(prev => prev.map(ci => ci.id === id ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci).filter(ci => ci.quantity > 0));
  const removeFromCart = (id: string) => setCart(prev => prev.filter(ci => ci.id !== id));
  const updateCartNotes = (id: string, notes: string) => setCart(prev => prev.map(ci => ci.id === id ? { ...ci, notes } : ci));
  const clearCart = () => setCart([]);
  const updateSettings = (s: Partial<StoreSettings>) => setSettings(prev => ({ ...prev, ...s }));

  /* ═══ Featured Items — resolved list ═══ */
  const featuredItems = useMemo(() => {
    const cfg = settings.featured || DEFAULT_FEATURED;
    if (!cfg.enabled) return [];
    // If admin has manually curated the list
    if (cfg.itemIds && cfg.itemIds.length > 0) {
      return cfg.itemIds.map(id => menuItems.find(m => m.id === id)).filter(Boolean) as MenuItem[];
    }
    // Fallback: use items with featured flag
    return menuItems.filter(m => m.featured);
  }, [menuItems, settings.featured]);

  /* ═══ Discount ═══ */
  const discountResult = useMemo<DiscountResult>(() => {
    const totalItems = cart.reduce((s, ci) => s + ci.quantity, 0);
    const subtotalRaw = cart.reduce((t, ci) => t + calcUnitPrice(ci.menuItem.price, ci.selectedOptions) * ci.quantity, 0);

    // Only use ENABLED tiers (not hidden ones for calculation — hidden means hidden from UI only)
    // But EACH tier only checks its OWN type (items or value) — never cross-check
    const allTiers = [...(settings.discountTiers || [])].sort((a, b) => {
      const aVal = (a.discountType === 'value') ? (a.minValue || 0) : a.minItems;
      const bVal = (b.discountType === 'value') ? (b.minValue || 0) : b.minItems;
      return aVal - bVal;
    });

    if (!settings.discountEnabled || allTiers.length === 0) {
      return { totalItems, currentTier: null, nextTier: allTiers[0] || null, discountPercent: 0, discountAmount: 0, progressToNext: 0, itemsToNextTier: allTiers[0]?.minItems || 0 };
    }

    // Find best matching tier — only match tiers of matching type
    let currentTier: DiscountTier | null = null;
    let nextTier: DiscountTier | null = null;

    for (let i = allTiers.length - 1; i >= 0; i--) {
      const tier = allTiers[i];
      let met = false;
      if (tier.discountType === 'value') {
        met = subtotalRaw >= (tier.minValue || 0);
      } else {
        // items type — only check items, never value
        met = totalItems >= tier.minItems;
      }
      if (met) {
        currentTier = tier;
        // Find next tier of SAME type only
        for (let j = i + 1; j < allTiers.length; j++) {
          if ((allTiers[j].discountType || 'items') === (tier.discountType || 'items')) {
            nextTier = allTiers[j]; break;
          }
        }
        break;
      }
    }

    // If no current tier, find first tier to aim for
    if (!currentTier) {
      nextTier = allTiers[0];
    }

    const discountPercent = currentTier?.discountPercent || 0;
    const subtotal = subtotalRaw;
    const discountAmount = subtotal * (discountPercent / 100);
    let progressToNext = 0, itemsToNextTier = 0;
    if (nextTier) { const prevMin = currentTier?.minItems || 0; progressToNext = Math.min(100, Math.max(0, ((totalItems - prevMin) / (nextTier.minItems - prevMin)) * 100)); itemsToNextTier = nextTier.minItems - totalItems; }
    else if (currentTier) { progressToNext = 100; }
    return { totalItems, currentTier, nextTier, discountPercent, discountAmount, progressToNext, itemsToNextTier };
  }, [cart, settings.discountTiers, settings.discountEnabled]);

  /* WhatsApp */
  const sendWhatsAppOrder = (deliveryMethod: string, name: string, phone: string, address: string) => {
    let msg = `*طلب جديد - PerfectChef*\n`;
    msg += `--------------------------------\n`;
    msg += `الاسم: *${name}*\n`;
    msg += `الهاتف: *${phone}*\n`;
    msg += `نوع الطلب: *${deliveryMethod === 'delivery' ? 'توصيل' : 'استلام'}*\n`;
    if (deliveryMethod === 'delivery' && address) msg += `العنوان: *${address}*\n`;
    msg += `--------------------------------\n`;
    msg += `*تفاصيل الطلب:*\n\n`;
    let subtotal = 0;
    cart.forEach((ci, i) => {
      const unitPrice = calcUnitPrice(ci.menuItem.price, ci.selectedOptions);
      const lineTotal = unitPrice * ci.quantity;
      subtotal += lineTotal;
      msg += `${i+1}. *${ci.menuItem.name}*`;
      if (ci.menuItem.nameEn) msg += ` - ${ci.menuItem.nameEn}`;
      msg += `\n`;
      if (ci.menuItem.sku) msg += `    الكود: ${ci.menuItem.sku}\n`;
      // Price line — clean format
      if (ci.menuItem.unit) {
        msg += `    ${unitPrice.toFixed(2)} ر.س / ${ci.menuItem.unit}\n`;
        msg += `    الكمية: ${ci.quantity}\n`;
      } else {
        msg += `    ${unitPrice.toFixed(2)} ر.س × ${ci.quantity}\n`;
      }
      msg += `    *الاجمالي: ${lineTotal.toFixed(2)} ر.س*\n`;
      if (ci.menuItem.packaging) msg += `    التعبئة: ${ci.menuItem.packaging}\n`;
      if (ci.selectedOptions.length > 0) msg += `    الاضافات: ${ci.selectedOptions.map(o => `${o.name}${o.price > 0 ? ` (+${o.price})` : ''}`).join(' , ')}\n`;
      if (ci.notes) msg += `    ملاحظة: ${ci.notes}\n`;
      msg += `\n`;
    });
    const { discountPercent, discountAmount } = discountResult;
    const afterDiscount = subtotal - discountAmount; const tax = afterDiscount * 0.15;
    const isFreeDelivery = afterDiscount >= 200;
    const deliveryFee = deliveryMethod === 'delivery' ? (isFreeDelivery ? 0 : 15) : 0;
    msg += `--------------------------------\n`;
    msg += `المجموع الفرعي: ${subtotal.toFixed(2)} ر.س\n`;
    if (discountPercent > 0) msg += `خصم الكمية (${discountPercent}%): -${discountAmount.toFixed(2)} ر.س\n`;
    msg += `الضريبة (15%): ${tax.toFixed(2)} ر.س\n`;
    if (deliveryFee > 0) msg += `رسوم التوصيل: ${deliveryFee.toFixed(2)} ر.س\n`;
    if (isFreeDelivery && deliveryMethod === 'delivery') msg += `التوصيل: مجاني\n`;
    msg += `--------------------------------\n`;
    msg += `*الاجمالي: ${(afterDiscount + tax + deliveryFee).toFixed(2)} ر.س*\n\n`;
    msg += `شكرا لاختياركم PerfectChef`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AppContext.Provider value={{
      isAdmin, login, logout,
      categories, addCategory, updateCategory, deleteCategory, replaceCategories,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem, replaceMenuItems,
      cart, addToCart, updateCartQuantity, removeFromCart, updateCartNotes, clearCart,
      settings, updateSettings, featuredItems, discountResult, sendWhatsAppOrder
    }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
