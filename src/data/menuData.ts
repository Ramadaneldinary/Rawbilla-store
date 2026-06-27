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
  isVariant?: boolean; // If true, selected option from this group replaces the base item name
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

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'appetizers', name: 'الشوكولا', emoji: '🥟', description: 'ابدأ وجبتك بهذه الأصناف اللذيذة' },
  { id: 'salads', name: 'الحشوات', emoji: '🥗', description: 'خيارات طازجة وصحية' },
  { id: 'mains', name: 'الأطباق الرئيسية', emoji: '🍽️', description: 'أشهر الأصناف المميزة' },
  { id: 'sides', name: 'الإضافات', emoji: '🍟', description: 'إضافات مثالية لأي وجبة' },
  { id: 'desserts', name: 'الحلويات', emoji: '🍰', description: 'حلويات شهية لختام رائع' },
  { id: 'beverages', name: 'المشروبات', emoji: '🥤', description: 'مشروبات منعشة ومحضرة بعناية' }
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'app-1', name: 'بطاطس الكمأة المقرمشة', category: 'appetizers', price: 35,
    description: 'بطاطس ذهبية مقلية مع زيت الكمأة البيضاء، جبنة البارميزان المبشورة، والبقدونس الطازج. تُقدم مع صلصة الأيولي بالثوم.',
    dietary: ['VG', 'NF'], calories: 420, imageEmoji: '🍟', images: [], colorClass: 'from-amber-100 to-orange-100', badge: 'الأكثر طلباً',
    optionGroups: [{ id: 'sauce-opt', name: 'صلصة إضافية', minSelection: 0, maxSelection: 2,
      options: [{ id: 'aioli', name: 'أيولي بالثوم', price: 4 }, { id: 'ketchup', name: 'كاتشب حار', price: 2 }, { id: 'ranch', name: 'رانش المنزل', price: 4 }] }]
  },
  {
    id: 'app-2', name: 'بروشيتا الأفوكادو', category: 'appetizers', price: 42,
    description: 'خبز العجين المخمر المحمص مع الأفوكادو المهروس، الطماطم الكرزية، الريحان، الثوم، وصلصة البلسمك الحلوة.',
    dietary: ['V', 'VG', 'DF', 'NF'], calories: 290, imageEmoji: '🥑', images: [], colorClass: 'from-emerald-50 to-teal-50', featured: true,
    optionGroups: [{ id: 'bread-opt', name: 'نوع الخبز', minSelection: 1, maxSelection: 1,
      options: [{ id: 'sourdough', name: 'عجين مخمر', price: 0 }, { id: 'gluten-free', name: 'خالي من الغلوتين', price: 6 }] }]
  },
  {
    id: 'app-3', name: 'روبيان ناري مقرمش', category: 'appetizers', price: 52,
    description: 'روبيان مقرمش مغطى بصلصة السريراتشا الكريمية الحارة ومزين بالبصل الأخضر.',
    dietary: ['DF', 'S'], calories: 380, imageEmoji: '🍤', images: [], colorClass: 'from-rose-50 to-orange-50', badge: '🔥 حار'
  },
  {
    id: 'app-4', name: 'طبق المقبلات المتوسطية', category: 'appetizers', price: 55,
    description: 'ثلاثية متوسطية كلاسيكية من الحمص، التزاتزيكي، وبابا غنوج. تُقدم مع خبز البيتا المشوي.',
    dietary: ['VG'], calories: 480, imageEmoji: '🧆', images: [], colorClass: 'from-amber-50 to-yellow-50'
  },
  {
    id: 'sal-1', name: 'سلطة الكينوا والكيل', category: 'salads', price: 55,
    description: 'كيل طازج مع التوت البري المجفف، بذور اليقطين، شرائح التفاح الطازج، وصلصة الليمون.',
    dietary: ['V', 'VG', 'GF', 'DF'], calories: 320, imageEmoji: '🥗', images: [], colorClass: 'from-emerald-50 to-green-100', featured: true,
    optionGroups: [{ id: 'protein-add', name: 'إضافة بروتين', minSelection: 0, maxSelection: 1,
      options: [{ id: 'chicken', name: 'دجاج مشوي بالأعشاب', price: 18 }, { id: 'tofu', name: 'توفو مشوي', price: 14 }, { id: 'salmon', name: 'سلمون مشوي', price: 25 }] }]
  },
  {
    id: 'sal-2', name: 'سيزر رويال', category: 'salads', price: 48,
    description: 'خس روماين مقرمش مع بارميزان محلي، خبز محمص، وصلصة كريمية غنية.',
    dietary: ['VG', 'NF'], calories: 360, imageEmoji: '🥬', images: [], colorClass: 'from-green-50 to-emerald-50'
  },
  {
    id: 'sal-3', name: 'شوربة الطماطم بالريحان', category: 'salads', price: 32,
    description: 'شوربة مخملية من الطماطم الناضجة والريحان الطازج مع لمسة من الكريمة.',
    dietary: ['VG', 'GF', 'NF'], calories: 240, imageEmoji: '🍅', images: [], colorClass: 'from-red-50 to-orange-50', badge: 'جديد'
  },
  {
    id: 'main-1', name: 'ريزوتو الفطر البري', category: 'mains', price: 78,
    description: 'أرز أربوريو مطهو في مرق خضروات غني مع فطر بورتوبيلو وشيتاكي والزبدة والنبيذ الأبيض والبارميزان.',
    dietary: ['VG', 'GF', 'NF'], calories: 550, imageEmoji: '🍄', images: [], colorClass: 'from-stone-100 to-amber-50'
  },
  {
    id: 'main-2', name: 'برجر الواغيو الفاخر', category: 'mains', price: 95,
    description: 'لحم واغيو فاخر، جبنة شيدر معتقة، بصل مكرمل، طماطم موروثة، وصلصتنا المميزة على خبز البريوش.',
    dietary: ['NF'], calories: 850, imageEmoji: '🍔', images: [], colorClass: 'from-orange-50 to-amber-100', featured: true, badge: 'اختيار الشيف',
    optionGroups: [{ id: 'burger-extras', name: 'إضافات البرجر', minSelection: 0, maxSelection: 3,
      options: [{ id: 'bacon', name: 'لحم بقر مدخن مقرمش', price: 10 }, { id: 'egg', name: 'بيض مقلي', price: 8 }, { id: 'avocado', name: 'شرائح أفوكادو', price: 8 }] }]
  },
  {
    id: 'main-3', name: 'كاري تايلاندي أخضر حار', category: 'mains', price: 72,
    description: 'مرق جوز الهند التايلاندي الأصيل الحار مع الخيزران والباذنجان والفلفل والريحان وأرز الياسمين.',
    dietary: ['V', 'VG', 'GF', 'DF', 'S'], calories: 610, imageEmoji: '🍛', images: [], colorClass: 'from-teal-50 to-emerald-50',
    optionGroups: [{ id: 'curry-protein', name: 'اختر الأساس', minSelection: 1, maxSelection: 1,
      options: [{ id: 'veg-curry', name: 'خضروات وتوفو', price: 0 }, { id: 'chicken-curry', name: 'دجاج مشوي', price: 8 }, { id: 'shrimp-curry', name: 'روبيان جامبو', price: 18 }] }]
  },
  {
    id: 'main-4', name: 'سلمون توسكاني المشوي', category: 'mains', price: 105,
    description: 'فيليه سلمون أطلسي مشوي على سرير من السبانخ بالزبدة والطماطم الكرزية وصلصة النبيذ الأبيض بالثوم.',
    dietary: ['GF', 'NF'], calories: 640, imageEmoji: '🐟', images: [], colorClass: 'from-cyan-50 to-blue-50', featured: true, badge: 'مميز'
  },
  {
    id: 'side-1', name: 'أصابع البطاطا الحلوة', category: 'sides', price: 26,
    description: 'أصابع بطاطا حلوة مشوية بالفرن مع البابريكا وملح البحر، تُقدم مع صلصة الحلو والحار.',
    dietary: ['V', 'VG', 'GF', 'DF', 'NF'], calories: 220, imageEmoji: '🍠', images: [], colorClass: 'from-amber-50 to-orange-100'
  },
  {
    id: 'side-2', name: 'بروكلي بالثوم والبارميزان', category: 'sides', price: 28,
    description: 'بروكلي مقرمش مطهو بزيت الزيتون والثوم المهروس مع رشة من البارميزان المعتق.',
    dietary: ['VG', 'GF', 'NF'], calories: 140, imageEmoji: '🥦', images: [], colorClass: 'from-emerald-50 to-green-50'
  },
  {
    id: 'des-1', name: 'كيك الشوكولاتة الساخنة', category: 'desserts', price: 42,
    description: 'كيكة شوكولاتة دافئة بقلب سائل منصهر. تُقدم مع آيس كريم الفانيلا.',
    dietary: ['VG', 'NF'], calories: 520, imageEmoji: '🍫', images: [], colorClass: 'from-stone-200 to-amber-50', featured: true, badge: 'الأكثر مبيعاً'
  },
  {
    id: 'des-2', name: 'تيراميسو كلاسيكي', category: 'desserts', price: 38,
    description: 'طبقات من بسكويت السافواردي بالقهوة وكريمة الماسكاربوني مع بودرة الكاكاو الداكنة.',
    dietary: ['VG', 'NF'], calories: 440, imageEmoji: '☕', images: [], colorClass: 'from-amber-50 to-stone-50'
  },
  {
    id: 'des-3', name: 'ثلاثي السوربيه', category: 'desserts', price: 32,
    description: 'ثلاث كرات منعشة من سوربيه التوت المشكل والمانجو والليمون مزينة بأوراق النعناع.',
    dietary: ['V', 'VG', 'GF', 'DF', 'NF'], calories: 180, imageEmoji: '🍧', images: [], colorClass: 'from-pink-50 to-rose-50'
  },
  {
    id: 'bev-1', name: 'ليموناضة الكركديه الفوارة', category: 'beverages', price: 22,
    description: 'كركديه منقوع محلياً مع ليمون طازج وشراب بسيط ومياه فوارة.',
    dietary: ['V', 'VG', 'GF', 'DF', 'NF'], calories: 110, imageEmoji: '🍹', images: [], colorClass: 'from-rose-50 to-pink-50'
  },
  {
    id: 'bev-2', name: 'لاتيه فانيلا مثلج', category: 'beverages', price: 24,
    description: 'إسبريسو بارد مع حليب كامل أو حليب نباتي محلى بشراب الفانيلا من مدغشقر.',
    dietary: ['VG', 'NF'], calories: 190, imageEmoji: '☕', images: [], colorClass: 'from-amber-50 to-stone-100',
    optionGroups: [{ id: 'milk-type', name: 'نوع الحليب', minSelection: 1, maxSelection: 1,
      options: [{ id: 'whole-milk', name: 'حليب كامل', price: 0 }, { id: 'oat-milk', name: 'حليب الشوفان', price: 3 }, { id: 'almond-milk', name: 'حليب اللوز', price: 3 }] }]
  },
  {
    id: 'bev-3', name: 'شاي باشن فروت المثلج', category: 'beverages', price: 20,
    description: 'شاي أسود فاخر مثلج بنكهة فاكهة الباشن فروت الطبيعية مع النعناع الطازج.',
    dietary: ['V', 'VG', 'GF', 'DF', 'NF'], calories: 80, imageEmoji: '🍵', images: [], colorClass: 'from-amber-50 to-yellow-50'
  }
];
