export interface OptionItem {
  id: string;
  name: string;
  price: number;
}

export interface OptionGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: OptionItem[];
}

export interface MenuItem {
  id: string;
  name: string;            // الاسم بالعربي
  nameEn?: string;         // الاسم بالإنجليزي
  category: string;
  price: number;
  description: string;
  dietary: string[];
  calories: number;
  imageEmoji: string;
  images: string[];
  colorClass: string;
  optionGroups?: OptionGroup[];
  featured?: boolean;
  discount?: number;
  badge?: string;
  prepTime?: string;
  qualityLabel?: string;
  showCalories?: boolean;
  showPrepTime?: boolean;
  showQuality?: boolean;
  unit?: string;
  packaging?: string;
  outOfStock?: boolean;
  sku?: string;
  orderCount?: number;
  hidden?: boolean;       // إخفاء الصنف من العرض
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  emojiType?: 'emoji' | 'image';
  displayMode?: 'image-only' | 'image-name' | 'name-only';
  description: string;
  sortOrder?: number;
}

/* ───── Dietary Filter (now dynamic & editable) ───── */
export interface DietaryFilter {
  id: string;
  label: string;
  icon: string;       // emoji OR image URL
  iconType: 'emoji' | 'image';
  color: string;
  enabled: boolean;
}

const COLOR_PRESETS = [
  'bg-emerald-100 text-emerald-800 border-emerald-300',
  'bg-lime-100 text-lime-800 border-lime-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-teal-100 text-teal-800 border-teal-300',
  'bg-red-100 text-red-800 border-red-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-pink-100 text-pink-800 border-pink-300',
  'bg-cyan-100 text-cyan-800 border-cyan-300',
  'bg-orange-100 text-orange-800 border-orange-300',
];
export { COLOR_PRESETS };

export const DEFAULT_DIETARY_FILTERS: DietaryFilter[] = [
  { id: 'V',  label: 'الشوكولا',          icon: '🌱',  iconType: 'emoji', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', enabled: true },
  { id: 'VG', label: 'الحشوات',     icon: '🥗',  iconType: 'emoji', color: 'bg-lime-100 text-lime-800 border-lime-300',         enabled: true },
  { id: 'GF', label: 'الخليط',  icon: '🌾',  iconType: 'emoji', color: 'bg-amber-100 text-amber-800 border-amber-300',      enabled: true },
  { id: 'DF', label: 'مشتقات الحلويات',   icon: '🥛',  iconType: 'emoji', color: 'bg-blue-100 text-blue-800 border-blue-300',         enabled: true },
  { id: 'NF', label: 'أيس كريم',  icon: '🥜',  iconType: 'emoji', color: 'bg-teal-100 text-teal-800 border-teal-300',         enabled: true },
  { id: 'S',  label: 'بسكويت',            icon: '🌶️', iconType: 'emoji', color: 'bg-red-100 text-red-800 border-red-300',            enabled: true },
];

/* ───── Keep a static fallback for backward compat ───── */
export const DIETARY_INFO = DEFAULT_DIETARY_FILTERS;

export const DEFAULT_CATEGORIES: Category[] = [];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [];
