import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Category, MenuItem, OptionItem, DietaryFilter, DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_DIETARY_FILTERS } from '../data/menuData';
import { calcUnitPrice } from '../utils/price';
import { incrementOrderCount } from '../utils/social';
import { supabase } from '../utils/supabaseClient';

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
  discountType?: 'items' | 'value' | 'cartons';  // default = 'items'
  targetItemId?: string;    // specific item ID for carton discount
  targetItemName?: string;  // specific item name for UI display
  discountPercent: number;
  label: string;
  visible: boolean;
}

const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { id: 'tier-1', minItems: 5,  discountPercent: 5,  label: 'برونزي',  visible: true },
  { id: 'tier-2', minItems: 10, discountPercent: 10, label: 'فضي',     visible: true },
  { id: 'tier-3', minItems: 15, discountPercent: 15, label: 'ذهبي',    visible: true },
  { id: 'tier-4', minItems: 20, discountPercent: 20, label: 'بلاتيني', visible: true },
];

/* ───── Featured Section Config ───── */
export interface FeaturedConfig {
  title: string;
  subtitle: string;
  enabled: boolean;
  itemIds: string[];       // ordered list of featured item IDs
  style: 'scroll' | 'grid';
  cartonDiscountEnabled?: boolean;
  cartonBuyThreshold?: number;
  cartonFreeCount?: number;
  cartonTargetItemId?: string;
}

const DEFAULT_FEATURED: FeaturedConfig = {
  title: 'الأصناف المميزة',
  subtitle: 'اكتشف أشهى اختياراتنا المختارة بعناية',
  enabled: true,
  itemIds: [],  // empty = use item.featured flag as fallback
  style: 'scroll',
  cartonDiscountEnabled: false,
  cartonBuyThreshold: 5,
  cartonFreeCount: 1,
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
  primaryTextColor: string;
}

const DEFAULT_TEXTS: CustomTexts = {
  menuTitle: 'قائمة الأصناف',
  heroTitle: 'اكتشف أصنافنا المميزة',
  heroSubtitle: 'اختر من تشكيلتنا الفاخرة، خصّص طلبك، وأرسله مباشرة عبر واتساب',
  searchPlaceholder: 'ابحث عن أصناف أو تصنيفات...',
  categoriesLabel: 'التصنيفات',
  footerTagline: 'صُنع من شغف لعشّاق الحلويات والشوكولا',
  productPopularText: 'من أكثر الأصناف طلباً هذا الأسبوع',
  featuredCountLabel: 'صنف',
  cartEmptyText: 'السلة فارغة',
  cartEmptyHint: 'اكتشف قائمتنا وأضف أصنافك المفضلة',
  discountHint: 'أضف {qty} قطع للحصول على خصم {pct}%',
  notePlaceholder: 'مثال: موقعك، وقت...',
  footerCopyright: 'جميع الحقوق محفوظة',
  footerBadge1: 'طلب آمن',
  footerBadge2: 'توصيل سريع',
  footerBadge3: 'ضمان الجودة',
  footerContactBtn: 'تواصل معنا',
  footerBrandName: 'RAWBILLA STORE',
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
  primaryTextColor: '#78350f',
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
  primaryColor?: string;
  secondaryColor?: string;
  brandTextColor: string;
  brandImgSize: number;
  brandFont: string;
  flashDeals: { enabled: boolean; items: { itemId: string; oldPrice: number; newPrice: number; endsAt: string }[] };
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
  cartonDiscountAmount: number;
  freeCartonsDetail: { itemName: string; freeCount: number; refundedValue: number }[];
}

/* ───── Context Type ───── */
interface AppState {
  isAdmin: boolean;
  login: (code: string) => boolean;
  logout: () => void;
  isLoading: boolean;
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
  replaceCategories: (cats: Category[]) => void;
  replaceMenuItems: (items: MenuItem[]) => void;
  featuredItems: MenuItem[];
  discountResult: DiscountResult;
  sendWhatsAppOrder: (deliveryMethod: string, name: string, phone: string, address: string) => void;
}

const AppContext = createContext<AppState | null>(null);
const ADMIN_CODE = 'MOD13';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
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
    brandText: 'RAWBILLA STORE',
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    brandTextColor: '#14b8a6',
    brandImgSize: 48,
    brandFont: '',
    flashDeals: { enabled: false, items: [] },
    recommendations: { enabled: true, title: 'قد يعجبك أيضاً' },
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    async function initDb() {
      try {
        const [catsRes, itemsRes, settingsRes] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order', { ascending: true }),
          supabase.from('menu_items').select('*'),
          supabase.from('settings').select('*').eq('id', 'store').maybeSingle()
        ]);

        if (catsRes.error) console.error("Error fetching categories:", catsRes.error);
        if (itemsRes.error) console.error("Error fetching menu items:", itemsRes.error);
        if (settingsRes.error) console.error("Error fetching settings:", settingsRes.error);

        if (!catsRes.error && catsRes.data && catsRes.data.length > 0) {
          setCategories(catsRes.data.map(c => ({
            id: c.id,
            name: c.name,
            emoji: c.emoji || '',
            emojiType: c.emoji_type as any,
            displayMode: c.display_mode as any,
            description: c.description || '',
            sortOrder: c.sort_order
          })));
        }

        if (!itemsRes.error && itemsRes.data && itemsRes.data.length > 0) {
          setMenuItems(itemsRes.data.map(item => ({
            id: item.id,
            name: item.name,
            nameEn: item.name_en,
            category: item.category,
            price: Number(item.price),
            description: item.description || '',
            dietary: item.dietary || [],
            calories: item.calories || 0,
            imageEmoji: item.image_emoji || '',
            images: item.images || [],
            colorClass: item.color_class || '',
            optionGroups: item.option_groups || [],
            featured: item.featured || false,
            discount: item.discount ? Number(item.discount) : undefined,
            badge: item.badge,
            prepTime: item.prep_time,
            qualityLabel: item.quality_label,
            showCalories: item.show_calories !== false,
            showPrepTime: item.show_prep_time !== false,
            showQuality: item.show_quality !== false,
            unit: item.unit,
            packaging: item.packaging,
            outOfStock: item.out_of_stock || false,
            sku: item.sku,
            orderCount: item.order_count || 0,
            hidden: item.hidden || false
          })));
        }

        if (!settingsRes.error && settingsRes.data) {
          const storeSettings = settingsRes.data;
          let logoUrl = storeSettings.logo_url || '';
          let headerBrandImgUrl = storeSettings.header_brand_img_url || '';

          if (headerBrandImgUrl === 'https://drive.google.com/file/d/1vz13kD11gFg38ik-U2Be7S0_0pvy7-ww/view?usp=drive_link') {
            headerBrandImgUrl = '';
            supabase.from('settings').update({ header_brand_img_url: '' }).eq('id', 'store').then(({ error }) => {
              if (error) console.error("Error clearing old default logo from Supabase:", error);
            });
          }
          if (logoUrl === 'https://drive.google.com/file/d/1vz13kD11gFg38ik-U2Be7S0_0pvy7-ww/view?usp=drive_link') {
            logoUrl = '';
            supabase.from('settings').update({ logo_url: '' }).eq('id', 'store').then(({ error }) => {
              if (error) console.error("Error clearing old default logo_url from Supabase:", error);
            });
          }

          setSettings({
            logoUrl: logoUrl,
            whatsappNumber: storeSettings.whatsapp_number || '966531254475',
            discountTiers: storeSettings.discount_tiers || DEFAULT_DISCOUNT_TIERS,
            discountEnabled: storeSettings.discount_enabled !== false,
            dietaryFilters: storeSettings.dietary_filters || DEFAULT_DIETARY_FILTERS,
            featured: storeSettings.featured || DEFAULT_FEATURED,
            texts: storeSettings.texts || DEFAULT_TEXTS,
            salesRep: storeSettings.sales_rep || { enabled: false, name: '', title: '', phone: '', photoUrl: '' },
            heroBgUrl: storeSettings.hero_bg_url || '',
            heroBgEnabled: storeSettings.hero_bg_enabled !== false,
            contentBgUrl: storeSettings.content_bg_url || '',
            contentBgEnabled: storeSettings.content_bg_enabled !== false,
            footerBgUrl: storeSettings.footer_bg_url || '',
            footerBgEnabled: storeSettings.footer_bg_enabled !== false,
            footerLogoUrl: storeSettings.footer_logo_url || '',
            headerBrandImgUrl: headerBrandImgUrl,
            brandText: storeSettings.brand_text || '',
            brandTextColor: storeSettings.brand_text_color || '#14b8a6',
            brandImgSize: storeSettings.brand_img_size || 48,
            brandFont: storeSettings.brand_font || '',
            flashDeals: storeSettings.flash_deals || { enabled: false, items: [] },
            recommendations: storeSettings.recommendations || { enabled: true, title: 'قد يعجبك أيضاً' },
          });
        }
      } catch (err) {
        console.error('Failed to init/fetch database from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDb();
  }, []);

  const login = (code: string) => { if (code === ADMIN_CODE) { setIsAdmin(true); return true; } return false; };
  const logout = () => setIsAdmin(false);

  const addCategory = async (cat: Category) => {
    setCategories(prev => [...prev, cat]);
    const { error } = await supabase.from('categories').insert({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      emoji_type: cat.emojiType || 'emoji',
      display_mode: cat.displayMode || 'image-name',
      description: cat.description,
      sort_order: cat.sortOrder || 0
    });
    if (error) console.error("Error adding category to Supabase:", error);
  };

  const updateCategory = async (id: string, patch: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.emoji !== undefined) updateData.emoji = patch.emoji;
    if (patch.emojiType !== undefined) updateData.emoji_type = patch.emojiType;
    if (patch.displayMode !== undefined) updateData.display_mode = patch.displayMode;
    if (patch.description !== undefined) updateData.description = patch.description;
    if (patch.sortOrder !== undefined) updateData.sort_order = patch.sortOrder;

    const { error } = await supabase.from('categories').update(updateData).eq('id', id);
    if (error) console.error("Error updating category in Supabase:", error);
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setMenuItems(prev => prev.filter(m => m.category !== id));
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error("Error deleting category from Supabase:", error);
  };

  const addMenuItem = async (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
    const { error } = await supabase.from('menu_items').insert({
      id: item.id,
      name: item.name,
      name_en: item.nameEn,
      category: item.category,
      price: item.price,
      description: item.description,
      dietary: item.dietary,
      calories: item.calories,
      image_emoji: item.imageEmoji,
      images: item.images,
      color_class: item.colorClass,
      option_groups: item.optionGroups,
      featured: item.featured,
      discount: item.discount,
      badge: item.badge,
      prep_time: item.prepTime,
      quality_label: item.qualityLabel,
      show_calories: item.showCalories,
      show_prep_time: item.showPrepTime,
      show_quality: item.showQuality,
      unit: item.unit,
      packaging: item.packaging,
      out_of_stock: item.outOfStock,
      sku: item.sku,
      order_count: item.orderCount,
      hidden: item.hidden
    });
    if (error) console.error("Error adding menu item to Supabase:", error);
  };

  const updateMenuItem = async (id: string, patch: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    const updateData: any = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.nameEn !== undefined) updateData.name_en = patch.nameEn;
    if (patch.category !== undefined) updateData.category = patch.category;
    if (patch.price !== undefined) updateData.price = patch.price;
    if (patch.description !== undefined) updateData.description = patch.description;
    if (patch.dietary !== undefined) updateData.dietary = patch.dietary;
    if (patch.calories !== undefined) updateData.calories = patch.calories;
    if (patch.imageEmoji !== undefined) updateData.image_emoji = patch.imageEmoji;
    if (patch.images !== undefined) updateData.images = patch.images;
    if (patch.colorClass !== undefined) updateData.color_class = patch.colorClass;
    if (patch.optionGroups !== undefined) updateData.option_groups = patch.optionGroups;
    if (patch.featured !== undefined) updateData.featured = patch.featured;
    if (patch.discount !== undefined) updateData.discount = patch.discount;
    if (patch.badge !== undefined) updateData.badge = patch.badge;
    if (patch.prepTime !== undefined) updateData.prep_time = patch.prepTime;
    if (patch.qualityLabel !== undefined) updateData.quality_label = patch.qualityLabel;
    if (patch.showCalories !== undefined) updateData.show_calories = patch.showCalories;
    if (patch.showPrepTime !== undefined) updateData.show_prep_time = patch.showPrepTime;
    if (patch.showQuality !== undefined) updateData.show_quality = patch.showQuality;
    if (patch.unit !== undefined) updateData.unit = patch.unit;
    if (patch.packaging !== undefined) updateData.packaging = patch.packaging;
    if (patch.outOfStock !== undefined) updateData.out_of_stock = patch.outOfStock;
    if (patch.sku !== undefined) updateData.sku = patch.sku;
    if (patch.orderCount !== undefined) updateData.order_count = patch.orderCount;
    if (patch.hidden !== undefined) updateData.hidden = patch.hidden;

    const { error } = await supabase.from('menu_items').update(updateData).eq('id', id);
    if (error) console.error("Error updating menu item in Supabase:", error);
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) console.error("Error deleting menu item from Supabase:", error);
  };

  const replaceCategories = async (cats: Category[]) => {
    setCategories(cats);
    await supabase.from('categories').delete().neq('id', '');
    const { error } = await supabase.from('categories').insert(cats.map(c => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      emoji_type: c.emojiType || 'emoji',
      display_mode: c.display_mode || 'image-name',
      description: c.description,
      sort_order: c.sortOrder || 0
    })));
    if (error) console.error("Error batch replacing categories in Supabase:", error);
  };

  const replaceMenuItems = async (items: MenuItem[]) => {
    setMenuItems(items);
    await supabase.from('menu_items').delete().neq('id', '');
    const { error } = await supabase.from('menu_items').insert(items.map(item => ({
      id: item.id,
      name: item.name,
      name_en: item.nameEn,
      category: item.category,
      price: item.price,
      description: item.description,
      dietary: item.dietary,
      calories: item.calories,
      image_emoji: item.imageEmoji,
      images: item.images,
      color_class: item.colorClass,
      option_groups: item.optionGroups,
      featured: item.featured,
      discount: item.discount,
      badge: item.badge,
      prep_time: item.prepTime,
      quality_label: item.qualityLabel,
      show_calories: item.showCalories,
      show_prep_time: item.showPrepTime,
      show_quality: item.showQuality,
      unit: item.unit,
      packaging: item.packaging,
      out_of_stock: item.outOfStock,
      sku: item.sku,
      order_count: item.orderCount,
      hidden: item.hidden
    })));
    if (error) console.error("Error batch replacing menu items in Supabase:", error);
  };

  const addToCart = (item: MenuItem, selectedOptions: OptionItem[]) => {
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
  
  const updateSettings = async (patch: Partial<StoreSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase.from('settings').upsert({
      id: 'store',
      logo_url: next.logoUrl,
      whatsapp_number: next.whatsappNumber,
      discount_tiers: next.discountTiers,
      discount_enabled: next.discountEnabled,
      dietary_filters: next.dietaryFilters,
      featured: next.featured,
      texts: next.texts,
      sales_rep: next.salesRep,
      hero_bg_url: next.heroBgUrl,
      hero_bg_enabled: next.heroBgEnabled,
      content_bg_url: next.contentBgUrl,
      content_bg_enabled: next.contentBgEnabled,
      footer_bg_url: next.footerBgUrl,
      footer_bg_enabled: next.footerBgEnabled,
      footer_logo_url: next.footerLogoUrl,
      header_brand_img_url: next.headerBrandImgUrl,
      brand_text: next.brandText,
      brand_text_color: next.brandTextColor,
      brand_img_size: next.brandImgSize,
      brand_font: next.brandFont,
      flash_deals: next.flashDeals,
      recommendations: next.recommendations
    });
    if (error) console.error("Error updating settings in Supabase:", error);
  };

  const featuredItems = useMemo(() => {
    const cfg = settings.featured || DEFAULT_FEATURED;
    if (!cfg.enabled) return [];
    if (cfg.itemIds && cfg.itemIds.length > 0) {
      return cfg.itemIds.map(id => menuItems.find(m => m.id === id)).filter(Boolean) as MenuItem[];
    }
    return menuItems.filter(m => m.featured);
  }, [menuItems, settings.featured]);

  const discountResult = useMemo<DiscountResult>(() => {
    const totalItems = cart.reduce((s, ci) => s + ci.quantity, 0);
    const subtotalRaw = cart.reduce((t, ci) => t + calcUnitPrice(ci.menuItem.price, ci.selectedOptions) * ci.quantity, 0);

    const totalCartons = cart.reduce((s, ci) => {
      const isCarton = (ci.menuItem.packaging && (
        ci.menuItem.packaging.includes('كرتون') ||
        ci.menuItem.packaging.includes('صندوق') ||
        ci.menuItem.packaging.includes('box') ||
        ci.menuItem.packaging.includes('carton')
      )) || (ci.menuItem.unit && (
        ci.menuItem.unit.includes('كرتون') ||
        ci.menuItem.unit.includes('صندوق') ||
        ci.menuItem.unit.includes('box') ||
        ci.menuItem.unit.includes('carton')
      ));
      return s + (isCarton ? ci.quantity : 0);
    }, 0);

    let cartonDiscountAmount = 0;
    const freeCartonsDetail: { itemName: string; freeCount: number; refundedValue: number }[] = [];

    const featuredConfig = settings.featured || DEFAULT_FEATURED;
    const cartonDiscountEnabled = featuredConfig.cartonDiscountEnabled;
    const cartonBuyThreshold = featuredConfig.cartonBuyThreshold || 5;
    const cartonFreeCount = featuredConfig.cartonFreeCount || 1;

    if (settings.discountEnabled && cartonDiscountEnabled && cartonBuyThreshold > 0 && cartonFreeCount > 0) {
      cart.forEach(ci => {
        if (featuredConfig.cartonTargetItemId && featuredConfig.cartonTargetItemId !== 'all' && ci.menuItem.id !== featuredConfig.cartonTargetItemId) return;

        const isCarton = (ci.menuItem.packaging && (
          ci.menuItem.packaging.includes('كرتون') ||
          ci.menuItem.packaging.includes('صندوق') ||
          ci.menuItem.packaging.includes('box') ||
          ci.menuItem.packaging.includes('carton')
        )) || (ci.menuItem.unit && (
          ci.menuItem.unit.includes('كرتون') ||
          ci.menuItem.unit.includes('صندوق') ||
          ci.menuItem.unit.includes('box') ||
          ci.menuItem.unit.includes('carton')
        ));
        
        if ((isCarton || featuredConfig.cartonTargetItemId) && ci.quantity >= cartonBuyThreshold) {
          const freeCount = Math.floor(ci.quantity / cartonBuyThreshold) * cartonFreeCount;
          const unitPrice = calcUnitPrice(ci.menuItem.price, ci.selectedOptions);
          const refundedValue = freeCount * unitPrice;
          cartonDiscountAmount += refundedValue;
          freeCartonsDetail.push({ itemName: ci.menuItem.name, freeCount, refundedValue });
        }
      });
    }

    const allTiers = [...(settings.discountTiers || [])].sort((a, b) => {
      const aVal = (a.discountType === 'value') ? (a.minValue || 0) : a.minItems;
      const bVal = (b.discountType === 'value') ? (b.minValue || 0) : b.minItems;
      return aVal - bVal;
    });

    const subtotalAfterCarton = Math.max(0, subtotalRaw - cartonDiscountAmount);

    if (!settings.discountEnabled || allTiers.length === 0) {
      return { totalItems, currentTier: null, nextTier: allTiers[0] || null, discountPercent: 0, discountAmount: 0, progressToNext: 0, itemsToNextTier: allTiers[0]?.minItems || 0, cartonDiscountAmount, freeCartonsDetail };
    }

    let currentTier: DiscountTier | null = null;
    let nextTier: DiscountTier | null = null;

    for (let i = allTiers.length - 1; i >= 0; i--) {
      const tier = allTiers[i];
      let met = false;
      if (tier.discountType === 'value') {
        met = subtotalAfterCarton >= (tier.minValue || 0);
      } else if (tier.discountType === 'cartons') {
        met = totalCartons >= tier.minItems;
      } else {
        met = totalItems >= tier.minItems;
      }
      if (met) {
        currentTier = tier;
        for (let j = i + 1; j < allTiers.length; j++) {
          if ((allTiers[j].discountType || 'items') === (tier.discountType || 'items')) {
            nextTier = allTiers[j]; break;
          }
        }
        break;
      }
    }

    if (!currentTier) {
      nextTier = allTiers[0];
    }

    const discountPercent = currentTier?.discountPercent || 0;
    const discountAmount = subtotalAfterCarton * (discountPercent / 100);
    let progressToNext = 0, itemsToNextTier = 0;

    if (nextTier) {
      const isVal = nextTier.discountType === 'value';
      const targetVal = isVal ? (nextTier.minValue || 0) : nextTier.minItems;
      const currentVal = isVal ? subtotalAfterCarton : (nextTier.discountType === 'cartons' ? totalCartons : totalItems);
      itemsToNextTier = Math.max(0, targetVal - currentVal);
      progressToNext = Math.min(100, (currentVal / targetVal) * 100);
    }

    return {
      totalItems,
      currentTier,
      nextTier,
      discountPercent,
      discountAmount,
      progressToNext,
      itemsToNextTier,
      cartonDiscountAmount,
      freeCartonsDetail
    };
  }, [cart, settings]);

  const sendWhatsAppOrder = (deliveryMethod: string, name: string, phone: string, address: string) => {
    // Implement or bind WhatsApp ordering logic here
  };

  return (
    <AppContext.Provider value={{
      isAdmin, login, logout, isLoading,
      categories, addCategory, updateCategory, deleteCategory,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
      cart, addToCart, updateCartQuantity, removeFromCart, updateCartNotes, clearCart,
      settings, updateSettings, replaceCategories, replaceMenuItems,
      featuredItems, discountResult, sendWhatsAppOrder
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
