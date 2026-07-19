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
  // Carton Special Offer
  cartonOfferEnabled?: boolean;
  cartonItemId?: string;
  cartonBuyQty?: number;
  cartonFreeQty?: number;
  itemOrder?: string[];
}

const DEFAULT_FEATURED: FeaturedConfig = {
  title: 'الأصناف المميزة',
  subtitle: 'اكتشف أشهى اختياراتنا المختارة بعناية',
  enabled: true,
  itemIds: [],  // empty = use item.featured flag as fallback
  style: 'scroll',
  cartonOfferEnabled: false,
  cartonItemId: '',
  cartonBuyQty: 20,
  cartonFreeQty: 1,
  itemOrder: []
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
  heroTitle: 'اطلب حلوياتك المفضلة الآن',
  menuTitle: 'قائمة الطعام',
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
  footerBrandName: 'Rawbilla',
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
  freeDeliveryThreshold: number;
  childDobField?: { enabled: boolean; label: string };
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
  cartonFreeCount: number;
  cartonDiscountAmount: number;
  cartonItemName?: string;
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
  sendWhatsAppOrder: (deliveryMethod: string, name: string, phone: string, address: string, childDob?: string) => void;
  reorderMenuItems: (draggedId: string, targetId: string) => void;
  reorderCategories: (draggedId: string, targetId: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppState | null>(null);
const ADMIN_CODE = 'MOD13';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
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
    brandText: '',
    brandTextColor: '#14b8a6',
    brandImgSize: 48,
    brandFont: '',
    flashDeals: { enabled: false, items: [] },
    recommendations: { enabled: true, title: 'قد يعجبك أيضاً' },
    freeDeliveryThreshold: 200,
    childDobField: { enabled: true, label: '👶 تاريخ ميلاد أول فرحة (أول مولود) لنجعله مميزاً! (اختياري)' }
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

        // Only set state and seed if there is no error for the respective query
        if (!catsRes.error && catsRes.data) {
          if (catsRes.data.length > 0) {
            setCategories(catsRes.data.map(c => ({
              id: c.id,
              name: c.name,
              emoji: c.emoji || '',
              emojiType: c.emoji_type as any,
              displayMode: c.display_mode as any,
              description: c.description || '',
              sortOrder: c.sort_order
            })));
          } else {
            // Seed defaults since table is empty
            const { error } = await supabase.from('categories').insert(DEFAULT_CATEGORIES.map(c => ({
              id: c.id,
              name: c.name,
              emoji: c.emoji,
              emoji_type: c.emojiType || 'emoji',
              display_mode: c.displayMode || 'image-name',
              description: c.description,
              sort_order: c.sortOrder || 0
            })));
            if (error) console.error("Error seeding categories:", error);
          }
        }

        if (!itemsRes.error && itemsRes.data) {
          if (itemsRes.data.length > 0) {
            const loadedItems = itemsRes.data.map(item => ({
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
            }));

            // Sort items by custom order if it exists
            const itemOrder = settingsRes.data?.featured?.itemOrder || [];
            if (itemOrder.length > 0) {
              const orderMap = new Map(itemOrder.map((id, index) => [id, index]));
              loadedItems.sort((a, b) => {
                const aIndex = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
                const bIndex = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
                return aIndex - bIndex;
              });
            }
            setMenuItems(loadedItems);
          } else {
            // Seed defaults since table is empty
            const { error } = await supabase.from('menu_items').insert(DEFAULT_MENU_ITEMS.map(item => ({
              id: item.id,
              name: item.name,
              name_en: item.nameEn || null,
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
              discount: item.discount || null,
              badge: item.badge || null,
              prep_time: item.prepTime || null,
              quality_label: item.qualityLabel || null,
              show_calories: item.showCalories !== false,
              show_prep_time: item.showPrepTime !== false,
              show_quality: item.showQuality !== false,
              unit: item.unit || null,
              packaging: item.packaging || null,
              out_of_stock: item.outOfStock || false,
              sku: item.sku || null,
              order_count: item.orderCount || 0,
              hidden: item.hidden || false
            })));
            if (error) console.error("Error seeding menu items:", error);
            
            // Re-fetch since it's freshly seeded
            const secondFetch = await supabase.from('menu_items').select('*');
            if (!secondFetch.error && secondFetch.data) {
              setMenuItems(secondFetch.data.map(item => ({
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
          }
        }

        if (!settingsRes.error) {
          if (settingsRes.data) {
            const storeSettings = settingsRes.data;
            setSettings({
              logoUrl: storeSettings.logo_url || '',
              whatsappNumber: storeSettings.whatsapp_number || '966531254475',
              discountTiers: storeSettings.discount_tiers || DEFAULT_DISCOUNT_TIERS,
              discountEnabled: storeSettings.discount_enabled !== false,
              dietaryFilters: storeSettings.dietary_filters || DEFAULT_DIETARY_FILTERS,
              featured: {
                ...DEFAULT_FEATURED,
                ...(storeSettings.featured || {}),
                cartonOfferEnabled: storeSettings.featured?.cartonOfferEnabled || false,
                cartonItemId: storeSettings.featured?.cartonItemId || '',
                cartonBuyQty: storeSettings.featured?.cartonBuyQty || 20,
                cartonFreeQty: storeSettings.featured?.cartonFreeQty || 1,
                itemOrder: storeSettings.featured?.itemOrder || []
              },
              texts: storeSettings.texts || DEFAULT_TEXTS,
              salesRep: storeSettings.sales_rep || { enabled: false, name: '', title: '', phone: '', photoUrl: '' },
              heroBgUrl: storeSettings.hero_bg_url || '',
              heroBgEnabled: storeSettings.hero_bg_enabled !== false,
              contentBgUrl: storeSettings.content_bg_url || '',
              contentBgEnabled: storeSettings.content_bg_enabled !== false,
              footerBgUrl: storeSettings.footer_bg_url || '',
              footerBgEnabled: storeSettings.footer_bg_enabled !== false,
              footerLogoUrl: storeSettings.footer_logo_url || '',
              headerBrandImgUrl: storeSettings.header_brand_img_url || '',
              brandText: storeSettings.brand_text || '',
              brandTextColor: storeSettings.brand_text_color || '#14b8a6',
              brandImgSize: storeSettings.brand_img_size || 48,
              brandFont: storeSettings.brand_font || '',
              flashDeals: storeSettings.flash_deals || { enabled: false, items: [] },
              recommendations: storeSettings.recommendations || { enabled: true, title: 'قد يعجبك أيضاً' },
              freeDeliveryThreshold: storeSettings.free_delivery_threshold ?? 200,
              childDobField: storeSettings.child_dob_field || { enabled: true, label: '👶 تاريخ ميلاد أول فرحة (أول مولود) لنجعله مميزاً! (اختياري)' },
            });
          } else {
            // Seed defaults since table has no config
            const resolvedSettings = {
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
              brandTextColor: '#14b8a6',
              brandImgSize: 48,
              brandFont: '',
              flashDeals: { enabled: false, items: [] },
              recommendations: { enabled: true, title: 'قد يعجبك أيضاً' },
              freeDeliveryThreshold: 200,
              childDobField: { enabled: true, label: '👶 تاريخ ميلاد أول فرحة (أول مولود) لنجعله مميزاً! (اختياري)' }
            };
            const { error } = await supabase.from('settings').insert({
              id: 'store',
              logo_url: resolvedSettings.logoUrl,
              whatsapp_number: resolvedSettings.whatsappNumber,
              discount_tiers: resolvedSettings.discountTiers,
              discount_enabled: resolvedSettings.discountEnabled,
              dietary_filters: resolvedSettings.dietaryFilters,
              featured: resolvedSettings.featured,
              texts: resolvedSettings.texts,
              sales_rep: resolvedSettings.salesRep,
              hero_bg_url: resolvedSettings.heroBgUrl,
              hero_bg_enabled: resolvedSettings.heroBgEnabled,
              content_bg_url: resolvedSettings.contentBgUrl,
              content_bg_enabled: resolvedSettings.contentBgEnabled,
              footer_bg_url: resolvedSettings.footerBgUrl,
              footer_bg_enabled: resolvedSettings.footerBgEnabled,
              footer_logo_url: resolvedSettings.footerLogoUrl,
              header_brand_img_url: resolvedSettings.headerBrandImgUrl,
              brand_text: resolvedSettings.brandText,
              brand_text_color: resolvedSettings.brandTextColor,
              brand_img_size: resolvedSettings.brandImgSize,
              brand_font: resolvedSettings.brandFont,
              flash_deals: resolvedSettings.flashDeals,
              recommendations: resolvedSettings.recommendations,
              free_delivery_threshold: resolvedSettings.freeDeliveryThreshold,
              child_dob_field: resolvedSettings.childDobField
            });
            if (error) console.error("Error seeding settings:", error);
          }
        }
      } catch (err) {
        console.error('Failed to init/fetch database from Supabase:', err);
      } finally {
        setLoading(false);
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

  /** Batch replace — for import */
  const replaceCategories = async (cats: Category[]) => {
    setCategories(cats);
    await supabase.from('categories').delete().neq('id', '');
    const { error } = await supabase.from('categories').insert(cats.map(c => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      emoji_type: c.emojiType || 'emoji',
      display_mode: c.displayMode || 'image-name',
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
      recommendations: next.recommendations,
      free_delivery_threshold: next.freeDeliveryThreshold,
      child_dob_field: next.childDobField
    });
    if (error) console.error("Error updating settings in Supabase:", error);
  };


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

    // Calculate carton offer discount
    let cartonFreeCount = 0;
    let cartonDiscountAmount = 0;
    let cartonItemName = '';
    
    const cartonCfg = settings.featured;
    if (cartonCfg?.cartonOfferEnabled && cartonCfg?.cartonItemId && cartonCfg?.cartonBuyQty && cartonCfg.cartonBuyQty > 0) {
      const targetItem = cart.find(ci => ci.menuItem.id === cartonCfg.cartonItemId);
      if (targetItem) {
        cartonFreeCount = Math.floor(targetItem.quantity / cartonCfg.cartonBuyQty) * (cartonCfg.cartonFreeQty || 1);
        cartonDiscountAmount = cartonFreeCount * calcUnitPrice(targetItem.menuItem.price, targetItem.selectedOptions);
        cartonItemName = targetItem.menuItem.name;
      }
    }

    const subtotalAfterCarton = Math.max(0, subtotalRaw - cartonDiscountAmount);

    // Only use ENABLED tiers (not hidden ones for calculation — hidden means hidden from UI only)
    // But EACH tier only checks its OWN type (items or value) — never cross-check
    const allTiers = [...(settings.discountTiers || [])].sort((a, b) => {
      const aVal = (a.discountType === 'value') ? (a.minValue || 0) : a.minItems;
      const bVal = (b.discountType === 'value') ? (b.minValue || 0) : b.minItems;
      return aVal - bVal;
    });

    if (!settings.discountEnabled || allTiers.length === 0) {
      return { 
        totalItems, 
        currentTier: null, 
        nextTier: allTiers[0] || null, 
        discountPercent: 0, 
        discountAmount: 0, 
        progressToNext: 0, 
        itemsToNextTier: allTiers[0]?.minItems || 0,
        cartonFreeCount,
        cartonDiscountAmount,
        cartonItemName
      };
    }

    // Find best matching tier — only match tiers of matching type
    let currentTier: DiscountTier | null = null;
    let nextTier: DiscountTier | null = null;

    for (let i = allTiers.length - 1; i >= 0; i--) {
      const tier = allTiers[i];
      let met = false;
      if (tier.discountType === 'value') {
        met = subtotalAfterCarton >= (tier.minValue || 0);
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
    const discountAmount = subtotalAfterCarton * (discountPercent / 100);
    let progressToNext = 0, itemsToNextTier = 0;
    if (nextTier) { 
      const prevMin = currentTier?.minItems || 0; 
      progressToNext = Math.min(100, Math.max(0, ((totalItems - prevMin) / (nextTier.minItems - prevMin)) * 100)); 
      itemsToNextTier = nextTier.minItems - totalItems; 
    }
    else if (currentTier) { 
      progressToNext = 100; 
    }
    return { 
      totalItems, 
      currentTier, 
      nextTier, 
      discountPercent, 
      discountAmount, 
      progressToNext, 
      itemsToNextTier,
      cartonFreeCount,
      cartonDiscountAmount,
      cartonItemName
    };
  }, [cart, settings.discountTiers, settings.discountEnabled, settings.featured]);

  /* WhatsApp */
  const sendWhatsAppOrder = (deliveryMethod: string, name: string, phone: string, address: string, childDob?: string) => {
    let msg = `*طلب جديد - RAWBILLA*\n`;
    msg += `--------------------------------\n`;
    msg += `الاسم: *${name}*\n`;
    msg += `الهاتف: *${phone}*\n`;
    if (childDob) msg += `تاريخ ميلاد أول فرحة: *${childDob}* 👶\n`;
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
    const { discountPercent, discountAmount, cartonFreeCount, cartonDiscountAmount, cartonItemName } = discountResult;
    
    if (cartonFreeCount > 0 && cartonItemName) {
      msg += `🎁 *هدية العرض الخاص:*\n`;
      msg += `    *${cartonItemName} - مجاني* × ${cartonFreeCount}\n`;
      msg += `    *الاجمالي: 0.00 ر.س*\n\n`;
    }

    const afterDiscount = Math.max(0, subtotal - discountAmount - cartonDiscountAmount); 
    const tax = afterDiscount * 0.15;
    const isFreeDelivery = afterDiscount >= (settings.freeDeliveryThreshold ?? 200);
    const deliveryFee = deliveryMethod === 'delivery' ? (isFreeDelivery ? 0 : 15) : 0;
    msg += `--------------------------------\n`;
    msg += `المجموع الفرعي: ${subtotal.toFixed(2)} ر.س\n`;
    if (cartonDiscountAmount > 0) msg += `خصم العرض الخاص: -${cartonDiscountAmount.toFixed(2)} ر.س\n`;
    if (discountPercent > 0) msg += `خصم الكمية (${discountPercent}%): -${discountAmount.toFixed(2)} ر.س\n`;
    msg += `الضريبة (15%): ${tax.toFixed(2)} ر.س\n`;
    if (deliveryFee > 0) msg += `رسوم التوصيل: ${deliveryFee.toFixed(2)} ر.س\n`;
    if (isFreeDelivery && deliveryMethod === 'delivery') msg += `التوصيل: مجاني\n`;
    msg += `--------------------------------\n`;
    msg += `*الاجمالي: ${(afterDiscount + tax + deliveryFee).toFixed(2)} ر.س*\n\n`;
    msg += `شكرا لاختياركم RAWBILLA`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const reorderMenuItems = (draggedId: string, targetId: string) => {
    setMenuItems(prev => {
      const list = [...prev];
      const draggedIdx = list.findIndex(m => m.id === draggedId);
      const targetIdx = list.findIndex(m => m.id === targetId);
      if (draggedIdx === -1 || targetIdx === -1) return prev;

      const [draggedItem] = list.splice(draggedIdx, 1);
      const newTargetIdx = list.findIndex(m => m.id === targetId);
      list.splice(newTargetIdx, 0, draggedItem);

      const newOrderIds = list.map(m => m.id);
      const updatedFeatured = {
        ...settings.featured,
        itemOrder: newOrderIds
      };

      updateSettings({ featured: updatedFeatured });
      return list;
    });
  };

  const reorderCategories = (draggedId: string, targetId: string) => {
    setCategories(prev => {
      const list = [...prev];
      const draggedIdx = list.findIndex(c => c.id === draggedId);
      const targetIdx = list.findIndex(c => c.id === targetId);
      if (draggedIdx === -1 || targetIdx === -1) return prev;
      
      const [draggedCat] = list.splice(draggedIdx, 1);
      const newTargetIdx = list.findIndex(c => c.id === targetId);
      list.splice(newTargetIdx, 0, draggedCat);
      
      const updatedList = list.map((c, i) => ({ ...c, sortOrder: i }));
      
      // Update sort order in Supabase
      updatedList.forEach(c => {
        supabase.from('categories').update({ sort_order: c.sortOrder }).eq('id', c.id).then(({ error }) => {
          if (error) console.error("Error updating category sort order:", error);
        });
      });
      
      return updatedList;
    });
  };

  return (
    <AppContext.Provider value={{
      isAdmin, login, logout,
      categories, addCategory, updateCategory, deleteCategory, replaceCategories,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem, replaceMenuItems,
      cart, addToCart, updateCartQuantity, removeFromCart, updateCartNotes, clearCart,
      settings, updateSettings, featuredItems, discountResult, sendWhatsAppOrder,
      reorderMenuItems, reorderCategories, loading
    }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
