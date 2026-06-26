import * as XLSX from 'xlsx';
import type { MenuItem, Category, DietaryFilter } from '../data/menuData';
import type { StoreSettings, DiscountTier, CustomTexts } from '../store/AppContext';

export function exportToExcel(categories: Category[], menuItems: MenuItem[], settings: StoreSettings) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Products
  const prodRows = menuItems.map(m => ({
    'ID': m.id, 'كود الصنف': m.sku || '', 'اسم المنتج (عربي)': m.name, 'اسم المنتج (إنجليزي)': m.nameEn || '',
    'التصنيف (ID)': m.category, 'التصنيف (اسم)': categories.find(c => c.id === m.category)?.name || '',
    'السعر (ر.س)': m.price, 'الوحدة': m.unit || '', 'التعبئة': m.packaging || '', 'الوصف': m.description,
    'السعرات الحرارية': m.calories, 'الشارة': m.badge || '', 'مميز': m.featured ? 'نعم' : 'لا',
    'نفذ المخزون': m.outOfStock ? 'نعم' : 'لا', 'مخفي': m.hidden ? 'نعم' : 'لا', 'عداد الطلبات': m.orderCount || 0,
    'وقت الاستلام': m.prepTime || '', 'وصف الجودة': m.qualityLabel || '',
    'إظهار السعرات': m.showCalories !== false ? 'نعم' : 'لا',
    'إظهار وقت الاستلام': m.showPrepTime !== false ? 'نعم' : 'لا',
    'إظهار الجودة': m.showQuality !== false ? 'نعم' : 'لا',
    'الصورة 1': m.images?.[0] || '', 'الصورة 2': m.images?.[1] || '', 'الصورة 3': m.images?.[2] || '',
    'لون الخلفية': m.colorClass || '', 'الفلاتر الغذائية': m.dietary?.join(', ') || '',
    'التخصيصات (JSON)': m.optionGroups?.length ? JSON.stringify(m.optionGroups) : '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), 'المنتجات');

  // Sheet 2: Categories
  const catRows = categories.map(c => ({ 'ID': c.id, 'اسم التصنيف': c.name, 'الوصف': c.description, 'رابط الصورة': c.emojiType === 'image' ? c.emoji : '', 'إيموجي': c.emojiType !== 'image' ? c.emoji : '', 'نوع الأيقونة': c.emojiType || 'emoji', 'طريقة العرض': c.displayMode || 'image-name' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(catRows), 'التصنيفات');

  // Sheet 3: Texts — ALL editable texts with descriptions
  const texts = settings.texts || {} as CustomTexts;
  const textDescs: Record<string, string> = {
    menuTitle: 'عنوان القائمة', heroTitle: 'العنوان الرئيسي', heroSubtitle: 'الوصف الفرعي',
    searchPlaceholder: 'نص خانة البحث', categoriesLabel: 'عنوان التصنيفات',
    footerTagline: 'عبارة أسفل الصفحة', productPopularText: 'نص الأكثر طلباً',
    featuredCountLabel: 'وحدة العد المميز', cartEmptyText: 'نص السلة فارغة',
    cartEmptyHint: 'وصف السلة الفارغة', discountHint: 'نص تحفيز خصم القطع',
    notePlaceholder: 'نص الملاحظة في السلة', footerCopyright: 'نص حقوق النشر',
    footerBadge1: 'شارة الفوتر 1', footerBadge2: 'شارة الفوتر 2', footerBadge3: 'شارة الفوتر 3',
    footerContactBtn: 'نص زر التواصل', footerBrandName: 'اسم العلامة في الفوتر',
    contactTitle: 'عنوان قائمة التواصل', contactWhatsApp: 'نص واتساب',
    contactWhatsAppHint: 'وصف واتساب', contactCall: 'نص اتصال', contactCallHint: 'وصف اتصال',
    cartTitle: 'عنوان السلة', cartSubtotal: 'نص المجموع', cartTax: 'نص الضريبة',
    cartTotal: 'نص الإجمالي', cartCheckoutBtn: 'زر إتمام الطلب', cartSendBtn: 'زر إرسال الطلب',
    cartNoteBtn: 'زر الملاحظة', cartBackBtn: 'زر رجوع', cartOrderInfo: 'عنوان معلومات الطلب',
    discountValueHint: 'نص تحفيز خصم القيمة', discountNextLabel: 'كلمة القادم',
    discountReachedMsg: 'رسالة أعلى خصم', discountSavedMsg: 'كلمة وفّرت',
  };
  const textRows = Object.entries(texts).map(([k, v]) => ({ 'المفتاح': k, 'الوصف': textDescs[k] || k, 'القيمة': v || '' }));
  const wsT = XLSX.utils.json_to_sheet(textRows);
  wsT['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsT, 'النصوص');

  // Sheet 4: Dietary
  const dietRows = (settings.dietaryFilters || []).map(d => ({ 'ID': d.id, 'الاسم': d.label, 'الأيقونة': d.icon, 'نوع الأيقونة': d.iconType || 'emoji', 'اللون': d.color, 'مفعّل': d.enabled ? 'نعم' : 'لا' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dietRows), 'الفلاتر الغذائية');

  // Sheet 5: Discounts
  const discRows = (settings.discountTiers || []).map(t => ({ 'ID': t.id, 'الاسم': t.label, 'نوع الخصم': t.discountType || 'items', 'الحد الأدنى (قطع)': t.minItems, 'الحد الأدنى (ر.س)': t.minValue || 0, 'نسبة الخصم (%)': t.discountPercent, 'ظاهر للعميل': t.visible ? 'نعم' : 'لا' }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(discRows), 'الخصومات');

  // Sheet 6: Settings — ALL settings
  const settRows = [
    // Branding
    { 'الإعداد': 'logoUrl', 'الوصف': 'رابط اللوجو', 'القيمة': settings.logoUrl || '' },
    { 'الإعداد': 'whatsappNumber', 'الوصف': 'رقم الواتساب', 'القيمة': settings.whatsappNumber || '' },
    { 'الإعداد': 'headerBrandImgUrl', 'الوصف': 'صورة بديلة عن PerfectChef', 'القيمة': settings.headerBrandImgUrl || '' },
    { 'الإعداد': 'brandText', 'الوصف': 'نص بديل عن PerfectChef', 'القيمة': settings.brandText || '' },
    { 'الإعداد': 'brandTextColor', 'الوصف': 'لون النص', 'القيمة': settings.brandTextColor || '' },
    { 'الإعداد': 'brandFont', 'الوصف': 'اسم الخط', 'القيمة': settings.brandFont || '' },
    { 'الإعداد': 'brandImgSize', 'الوصف': 'حجم صورة الشعار (بكسل)', 'القيمة': String(settings.brandImgSize || 48) },
    // Footer
    { 'الإعداد': 'footerLogoUrl', 'الوصف': 'صورة لوجو الفوتر', 'القيمة': settings.footerLogoUrl || '' },
    // Backgrounds
    { 'الإعداد': 'heroBgUrl', 'الوصف': 'خلفية البانر الرئيسي', 'القيمة': settings.heroBgUrl || '' },
    { 'الإعداد': 'heroBgEnabled', 'الوصف': 'تفعيل خلفية البانر', 'القيمة': settings.heroBgEnabled !== false ? 'نعم' : 'لا' },
    { 'الإعداد': 'contentBgUrl', 'الوصف': 'خلفية صفحة الأصناف', 'القيمة': settings.contentBgUrl || '' },
    { 'الإعداد': 'contentBgEnabled', 'الوصف': 'تفعيل خلفية الأصناف', 'القيمة': settings.contentBgEnabled !== false ? 'نعم' : 'لا' },
    { 'الإعداد': 'footerBgUrl', 'الوصف': 'خلفية الفوتر', 'القيمة': settings.footerBgUrl || '' },
    { 'الإعداد': 'footerBgEnabled', 'الوصف': 'تفعيل خلفية الفوتر', 'القيمة': settings.footerBgEnabled !== false ? 'نعم' : 'لا' },
    // Discount
    { 'الإعداد': 'discountEnabled', 'الوصف': 'تفعيل نظام الخصم', 'القيمة': settings.discountEnabled ? 'نعم' : 'لا' },
    // Featured
    { 'الإعداد': 'featured.title', 'الوصف': 'عنوان القسم المميز', 'القيمة': settings.featured?.title || '' },
    { 'الإعداد': 'featured.subtitle', 'الوصف': 'وصف القسم المميز', 'القيمة': settings.featured?.subtitle || '' },
    { 'الإعداد': 'featured.enabled', 'الوصف': 'تفعيل القسم المميز', 'القيمة': settings.featured?.enabled ? 'نعم' : 'لا' },
    { 'الإعداد': 'featured.style', 'الوصف': 'شكل القسم المميز', 'القيمة': settings.featured?.style || 'scroll' },
    // Sales Rep
    { 'الإعداد': 'salesRep.enabled', 'الوصف': 'تفعيل بطاقة المبيعات', 'القيمة': settings.salesRep?.enabled ? 'نعم' : 'لا' },
    { 'الإعداد': 'salesRep.name', 'الوصف': 'اسم موظف المبيعات', 'القيمة': settings.salesRep?.name || '' },
    { 'الإعداد': 'salesRep.title', 'الوصف': 'المسمّى الوظيفي', 'القيمة': settings.salesRep?.title || '' },
    { 'الإعداد': 'salesRep.phone', 'الوصف': 'رقم واتساب الموظف', 'القيمة': settings.salesRep?.phone || '' },
    { 'الإعداد': 'salesRep.photoUrl', 'الوصف': 'صورة الموظف', 'القيمة': settings.salesRep?.photoUrl || '' },
    // Recommendations
    { 'الإعداد': 'recommendations.enabled', 'الوصف': 'تفعيل التوصيات الذكية', 'القيمة': settings.recommendations?.enabled ? 'نعم' : 'لا' },
    { 'الإعداد': 'recommendations.title', 'الوصف': 'عنوان التوصيات', 'القيمة': settings.recommendations?.title || '' },
    // Flash Deals
    { 'الإعداد': 'flashDeals.enabled', 'الوصف': 'تفعيل العروض المحدودة', 'القيمة': settings.flashDeals?.enabled ? 'نعم' : 'لا' },
  ];
  const wsS = XLSX.utils.json_to_sheet(settRows);
  wsS['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsS, 'الإعدادات');

  XLSX.writeFile(wb, `ModMenu-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function yn(v: unknown): boolean { return String(v).trim() === 'نعم'; }
function isUrl(v: string): boolean { return /^https?:\/\//i.test(v.trim()) || /drive\.google\.com/i.test(v.trim()); }

export interface ImportResult {
  categories: Category[]; menuItems: MenuItem[]; texts: Partial<CustomTexts>;
  dietaryFilters: DietaryFilter[]; discountTiers: DiscountTier[];
  generalSettings: Record<string, string>;
  stats: { cats: number; items: number; texts: number; diets: number; tiers: number };
}

export function importFromExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const result: ImportResult = { categories: [], menuItems: [], texts: {}, dietaryFilters: [], discountTiers: [], generalSettings: {}, stats: { cats: 0, items: 0, texts: 0, diets: 0, tiers: 0 } };

        // Products
        const ps = wb.Sheets['المنتجات'];
        if (ps) {
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ps);
          result.menuItems = rows.filter(r => r['اسم المنتج (عربي)'] || r['اسم المنتج']).map(r => {
            const imgs: string[] = [];
            if (r['الصورة 1']) imgs.push(String(r['الصورة 1']));
            if (r['الصورة 2']) imgs.push(String(r['الصورة 2']));
            if (r['الصورة 3']) imgs.push(String(r['الصورة 3']));
            let optionGroups: MenuItem['optionGroups'] = [];
            try { const s = String(r['التخصيصات (JSON)'] || '').trim(); if (s) optionGroups = JSON.parse(s); } catch {}
            return { id: String(r['ID'] || `item-${Date.now()}-${Math.random().toString(36).slice(2,6)}`), sku: String(r['كود الصنف'] || ''), name: String(r['اسم المنتج (عربي)'] || r['اسم المنتج'] || ''), nameEn: String(r['اسم المنتج (إنجليزي)'] || ''), category: String(r['التصنيف (ID)'] || ''), price: Number(r['السعر (ر.س)']) || 0, description: String(r['الوصف'] || ''), calories: Number(r['السعرات الحرارية']) || 0, badge: String(r['الشارة'] || ''), featured: yn(r['مميز']), outOfStock: yn(r['نفذ المخزون']), hidden: yn(r['مخفي']), orderCount: Number(r['عداد الطلبات']) || 0, unit: String(r['الوحدة'] || ''), packaging: String(r['التعبئة'] || ''), prepTime: String(r['وقت الاستلام'] || ''), qualityLabel: String(r['وصف الجودة'] || ''), showCalories: r['إظهار السعرات'] === undefined || yn(r['إظهار السعرات']), showPrepTime: r['إظهار وقت الاستلام'] === undefined || yn(r['إظهار وقت الاستلام']), showQuality: r['إظهار الجودة'] === undefined || yn(r['إظهار الجودة']), images: imgs, imageEmoji: '', colorClass: String(r['لون الخلفية'] || 'from-amber-100 to-orange-100'), dietary: String(r['الفلاتر الغذائية'] || '').split(',').map(s => s.trim()).filter(Boolean), optionGroups } as MenuItem;
          });
          result.stats.items = result.menuItems.length;
        }

        // Categories
        const cs = wb.Sheets['التصنيفات'];
        if (cs) {
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(cs);
          result.categories = rows.filter(r => r['ID']).map(r => {
            const imgUrl = String(r['رابط الصورة'] || '').trim();
            const emojiVal = String(r['إيموجي'] || '').trim();
            let emoji = imgUrl || emojiVal || '';
            let emojiType: 'emoji' | 'image' = String(r['نوع الأيقونة'] || '') === 'image' || isUrl(imgUrl) || isUrl(emojiVal) ? 'image' : 'emoji';
            return { id: String(r['ID']), name: String(r['اسم التصنيف'] || ''), description: String(r['الوصف'] || ''), emoji, emojiType, displayMode: (String(r['طريقة العرض'] || 'image-name')) as Category['displayMode'] };
          });
          result.stats.cats = result.categories.length;
        }

        // Texts
        const ts = wb.Sheets['النصوص'];
        if (ts) { XLSX.utils.sheet_to_json<Record<string, unknown>>(ts).forEach(r => { const k = String(r['المفتاح'] || ''); const v = String(r['القيمة'] || ''); if (k && v) (result.texts as Record<string, string>)[k] = v; }); result.stats.texts = Object.keys(result.texts).length; }

        // Dietary
        const ds = wb.Sheets['الفلاتر الغذائية'];
        if (ds) { result.dietaryFilters = XLSX.utils.sheet_to_json<Record<string, unknown>>(ds).filter(r => r['ID']).map(r => { const icon = String(r['الأيقونة'] || '🏷️'); return { id: String(r['ID']), label: String(r['الاسم'] || ''), icon, iconType: (String(r['نوع الأيقونة'] || '') === 'image' || isUrl(icon) ? 'image' : 'emoji') as 'emoji'|'image', color: String(r['اللون'] || 'bg-emerald-100 text-emerald-800 border-emerald-300'), enabled: r['مفعّل'] === undefined || yn(r['مفعّل']) }; }); result.stats.diets = result.dietaryFilters.length; }

        // Discounts
        const dcs = wb.Sheets['الخصومات'];
        if (dcs) { result.discountTiers = XLSX.utils.sheet_to_json<Record<string, unknown>>(dcs).filter(r => r['ID']).map(r => ({ id: String(r['ID']), label: String(r['الاسم'] || ''), discountType: (String(r['نوع الخصم'] || 'items')) as 'items'|'value', minItems: Number(r['الحد الأدنى (قطع)']) || 0, minValue: Number(r['الحد الأدنى (ر.س)']) || 0, discountPercent: Number(r['نسبة الخصم (%)']) || 0, visible: r['ظاهر للعميل'] === undefined || yn(r['ظاهر للعميل']) })); result.stats.tiers = result.discountTiers.length; }

        // Settings
        const ss = wb.Sheets['الإعدادات'];
        if (ss) { XLSX.utils.sheet_to_json<Record<string, unknown>>(ss).forEach(r => { const k = String(r['الإعداد'] || ''); const v = String(r['القيمة'] || ''); if (k) result.generalSettings[k] = v; }); }

        resolve(result);
      } catch (err) { reject(new Error('خطأ في قراءة الملف: ' + (err instanceof Error ? err.message : ''))); }
    };
    reader.readAsArrayBuffer(file);
  });
}
