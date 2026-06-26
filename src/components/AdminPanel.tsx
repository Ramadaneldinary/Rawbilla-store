import { useState } from 'react';
import { useApp, DiscountTier, FeaturedConfig, DEFAULT_TEXTS } from '../store/AppContext';
import { MenuItem, Category, DietaryFilter, COLOR_PRESETS } from '../data/menuData';
import { getCategoryLabel } from './CategoryIcon';
import { X, Plus, Pencil, Trash2, Save, Upload, LogOut, Settings, Package, Tag, Image, Gift, SlidersHorizontal, Eye, EyeOff, ToggleLeft, ToggleRight, Star, ArrowUp, ArrowDown, LayoutGrid, GripHorizontal, Type, Download, FileUp, FileDown, AlertTriangle, CheckCircle, FileSpreadsheet, Zap } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../utils/excel';

const COLOR_OPTIONS = ['from-amber-100 to-orange-100','from-emerald-50 to-teal-50','from-rose-50 to-orange-50','from-amber-50 to-yellow-50','from-emerald-50 to-green-100','from-green-50 to-emerald-50','from-red-50 to-orange-50','from-stone-100 to-amber-50','from-orange-50 to-amber-100','from-teal-50 to-emerald-50','from-cyan-50 to-blue-50','from-pink-50 to-rose-50','from-stone-200 to-amber-50','from-amber-50 to-stone-50','from-amber-50 to-stone-100'];
const ICON_EMOJIS = ['🌱','🥗','🌾','🥛','🥜','🌶️','🍖','🐄','🐔','🐠','🦐','🥚','🍯','🫘','🥥','🧈','🫒','🧂','💊','❌','✅','⭐','🔥','❄️','🌿'];

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const ctx = useApp();
  type TabKey = 'products' | 'categories' | 'featured' | 'discounts' | 'dietary' | 'settings' | 'importexport' | 'marketing';
  const [importStatus, setImportStatus] = useState<{ type: 'success'|'error'; msg: string }|null>(null);
  const [tab, setTab] = useState<TabKey>('products');
  const [dragId, setDragId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<Partial<Category>>({}); const [editingCatId, setEditingCatId] = useState<string|null>(null); const [showCatForm, setShowCatForm] = useState(false);
  const [prodForm, setProdForm] = useState<Partial<MenuItem>>({}); const [editingProdId, setEditingProdId] = useState<string|null>(null); const [showProdForm, setShowProdForm] = useState(false); const [newImageUrl, setNewImageUrl] = useState('');
  const [logoInput, setLogoInput] = useState(ctx.settings.logoUrl);
  const [tierForm, setTierForm] = useState<Partial<DiscountTier>>({}); const [editingTierId, setEditingTierId] = useState<string|null>(null); const [showTierForm, setShowTierForm] = useState(false);
  const [dietForm, setDietForm] = useState<Partial<DietaryFilter>>({}); const [editingDietId, setEditingDietId] = useState<string|null>(null); const [showDietForm, setShowDietForm] = useState(false);
  const dietaryFilters = ctx.settings.dietaryFilters || [];
  const featuredCfg: FeaturedConfig = ctx.settings.featured || { title: 'الأطباق المميزة', subtitle: '', enabled: true, itemIds: [], style: 'scroll' };
  const [featTitle, setFeatTitle] = useState(featuredCfg.title);
  const [featSubtitle, setFeatSubtitle] = useState(featuredCfg.subtitle);
  const salesRep = ctx.settings.salesRep || { enabled: false, name: '', title: '', phone: '', photoUrl: '' };
  const [repForm, setRepForm] = useState({ ...salesRep });
  const [heroBgInput, setHeroBgInput] = useState(ctx.settings.heroBgUrl || '');
  const [contentBgInput, setContentBgInput] = useState(ctx.settings.contentBgUrl || '');
  const [footerBgInput, setFooterBgInput] = useState(ctx.settings.footerBgUrl || '');
  const [footerLogoInput, setFooterLogoInput] = useState(ctx.settings.footerLogoUrl || '');
  const texts = ctx.settings.texts || DEFAULT_TEXTS;
  const [editTexts, setEditTexts] = useState({ ...texts });

  // ── Category ──
  const resetCatForm = () => { setCatForm({}); setEditingCatId(null); setShowCatForm(false); };
  const handleSaveCategory = () => {
    // Allow saving without name if image-only mode with an image
    const isImgOnly = catForm.displayMode === 'image-only' && catForm.emoji?.trim();
    if (!catForm.name?.trim() && !isImgOnly) return;
    const data = { name: catForm.name || '', emoji: catForm.emoji || '', emojiType: (catForm.emojiType || 'image') as 'emoji'|'image', displayMode: (catForm.displayMode || 'image-name') as Category['displayMode'], description: catForm.description || '' };
    if (editingCatId) ctx.updateCategory(editingCatId, data);
    else ctx.addCategory({ id: `cat-${Date.now()}`, ...data });
    resetCatForm();
  };
  const startEditCat = (cat: Category) => { setCatForm(cat); setEditingCatId(cat.id); setShowCatForm(true); };
  const moveCat = (id: string, dir: -1 | 1) => {
    const arr = [...ctx.categories];
    const idx = arr.findIndex(c => c.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    ctx.replaceCategories(arr);
  };
  const moveProd = (id: string, dir: -1 | 1) => {
    const arr = [...ctx.menuItems];
    const idx = arr.findIndex(m => m.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    ctx.replaceMenuItems(arr);
  };
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const arr = [...ctx.menuItems];
    const fromIdx = arr.findIndex(m => m.id === dragId);
    const toIdx = arr.findIndex(m => m.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    ctx.replaceMenuItems(arr);
    setDragId(null);
  };

  // ── Product ──
  const resetProdForm = () => { setProdForm({}); setEditingProdId(null); setShowProdForm(false); setNewImageUrl(''); };
  const handleSaveProduct = () => {
    if (!prodForm.name?.trim() || !prodForm.category || !prodForm.price) return;
    const item: MenuItem = { id: editingProdId || `item-${Date.now()}`, name: prodForm.name!, nameEn: prodForm.nameEn || '', category: prodForm.category!, price: prodForm.price!, description: prodForm.description || '', dietary: prodForm.dietary || [], calories: prodForm.calories || 0, imageEmoji: '', images: prodForm.images || [], colorClass: prodForm.colorClass || COLOR_OPTIONS[0], badge: prodForm.badge || '', featured: prodForm.featured || false, prepTime: prodForm.prepTime || '', qualityLabel: prodForm.qualityLabel || '', showCalories: prodForm.showCalories !== false, showPrepTime: prodForm.showPrepTime !== false, showQuality: prodForm.showQuality !== false, unit: prodForm.unit || '', packaging: prodForm.packaging || '', optionGroups: prodForm.optionGroups || [], outOfStock: prodForm.outOfStock || false, sku: prodForm.sku || '', orderCount: prodForm.orderCount || 0, hidden: prodForm.hidden || false };
    if (editingProdId) ctx.updateMenuItem(editingProdId, item); else ctx.addMenuItem(item);
    resetProdForm();
  };
  const startEditProd = (m: MenuItem) => { setProdForm({ ...m }); setEditingProdId(m.id); setShowProdForm(true); };
  const addImage = () => { if (!newImageUrl.trim()) return; setProdForm(prev => ({ ...prev, images: [...(prev.images || []), newImageUrl.trim()] })); setNewImageUrl(''); };
  const removeImage = (idx: number) => { setProdForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) })); };
  const toggleDiet = (d: string) => { const c = prodForm.dietary || []; setProdForm(p => ({ ...p, dietary: c.includes(d) ? c.filter(x => x !== d) : [...c, d] })); };

  // ── Discount ──
  const resetTierForm = () => { setTierForm({}); setEditingTierId(null); setShowTierForm(false); };
  const handleSaveTier = () => { if (!tierForm.minItems || !tierForm.discountPercent || !tierForm.label?.trim()) return; const c = [...(ctx.settings.discountTiers || [])]; if (editingTierId) ctx.updateSettings({ discountTiers: c.map(t => t.id === editingTierId ? { ...t, ...tierForm } as DiscountTier : t) }); else ctx.updateSettings({ discountTiers: [...c, { id: `tier-${Date.now()}`, minItems: tierForm.minItems!, discountPercent: tierForm.discountPercent!, label: tierForm.label!, visible: tierForm.visible !== false }] }); resetTierForm(); };
  const startEditTier = (t: DiscountTier) => { setTierForm({ ...t }); setEditingTierId(t.id); setShowTierForm(true); };
  const sortedTiers = [...(ctx.settings.discountTiers || [])].sort((a, b) => a.minItems - b.minItems);
  const TE: Record<number,string> = { 0: '🥉', 1: '🥈', 2: '🥇', 3: '💎' };

  // ── Dietary ──
  const resetDietForm = () => { setDietForm({}); setEditingDietId(null); setShowDietForm(false); };
  const handleSaveDiet = () => { if (!dietForm.label?.trim() || !dietForm.id?.trim()) return; const c = [...dietaryFilters]; if (editingDietId) ctx.updateSettings({ dietaryFilters: c.map(d => d.id === editingDietId ? { ...d, ...dietForm } as DietaryFilter : d) }); else { if (c.some(d => d.id === dietForm.id)) return; ctx.updateSettings({ dietaryFilters: [...c, { id: dietForm.id!, label: dietForm.label!, icon: dietForm.icon || '🏷️', iconType: dietForm.iconType || 'emoji', color: dietForm.color || COLOR_PRESETS[0], enabled: dietForm.enabled !== false }] }); } resetDietForm(); };
  const startEditDiet = (d: DietaryFilter) => { setDietForm({ ...d }); setEditingDietId(d.id); setShowDietForm(true); };

  // ── Featured ──
  const currentIds = featuredCfg.itemIds || [];
  const isFeatured = (id: string) => currentIds.includes(id);
  const toggleFeaturedItem = (id: string) => { const n = isFeatured(id) ? currentIds.filter(x => x !== id) : [...currentIds, id]; ctx.updateSettings({ featured: { ...featuredCfg, itemIds: n } }); };
  const moveFeatured = (id: string, dir: -1|1) => { const ids = [...currentIds]; const i = ids.indexOf(id); if (i < 0) return; const j = i + dir; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; ctx.updateSettings({ featured: { ...featuredCfg, itemIds: ids } }); };

  // ── Texts Save ──
  const saveTexts = () => ctx.updateSettings({ texts: editTexts });

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-amber-400" /><h2 className="text-base font-black">لوحة تحكم الأدمن</h2></div>
          <div className="flex items-center gap-2">
            <button onClick={() => { ctx.logout(); onClose(); }} className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"><LogOut className="w-3.5 h-3.5" /> خروج</button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 shrink-0 overflow-x-auto scrollbar-none">
          {([
            { key: 'products' as TabKey, label: 'المنتجات', icon: <Package className="w-3.5 h-3.5" /> },
            { key: 'categories' as TabKey, label: 'التصنيفات', icon: <Tag className="w-3.5 h-3.5" /> },
            { key: 'featured' as TabKey, label: 'القسم المميز', icon: <Star className="w-3.5 h-3.5" /> },
            { key: 'dietary' as TabKey, label: 'الفلاتر', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
            { key: 'discounts' as TabKey, label: 'الخصومات', icon: <Gift className="w-3.5 h-3.5" /> },
            { key: 'marketing' as TabKey, label: 'التسويق', icon: <Zap className="w-3.5 h-3.5" /> },
            { key: 'importexport' as TabKey, label: 'استيراد/تصدير', icon: <FileDown className="w-3.5 h-3.5" /> },
            { key: 'settings' as TabKey, label: 'الإعدادات', icon: <Settings className="w-3.5 h-3.5" /> },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 min-w-[65px] py-2.5 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer border-b-2 whitespace-nowrap ${tab === t.key ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t.icon} {t.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* ═══ SETTINGS TAB ═══ */}
          {tab === 'settings' && (
            <div className="space-y-6 max-w-lg mx-auto animate-slideUp">
              {/* Logo */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><Image className="w-4 h-4 text-amber-500" /> رابط اللوجو</label>
                <input type="text" value={logoInput} onChange={e => setLogoInput(e.target.value)} placeholder="https://... أو Google Drive" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500" />
                <button onClick={() => ctx.updateSettings({ logoUrl: logoInput })} className="mt-3 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition flex items-center gap-2"><Upload className="w-4 h-4" /> حفظ اللوجو</button>
                {ctx.settings.logoUrl && (<div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-xs font-bold text-slate-600 mb-2">المعاينة:</p><img src={convertUrl(ctx.settings.logoUrl)} alt="" className="h-16 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" /><button onClick={() => { ctx.updateSettings({ logoUrl: '' }); setLogoInput(''); }} className="mt-2 text-xs text-red-500 font-bold hover:underline cursor-pointer">حذف اللوجو</button></div>)}
              </div>

              {/* Footer Logo/Image */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-amber-800 flex items-center gap-1.5">🖼️ صورة/لوجو أسفل الصفحة (الفوتر)</h4>
                <p className="text-[10px] text-amber-600 font-medium">استورد صورة تظهر بدلاً من نص PerfectChef في الفوتر — اتركه فارغاً لاستخدام النص</p>
                <input value={footerLogoInput} onChange={e => setFooterLogoInput(e.target.value)} placeholder="رابط صورة الفوتر (اختياري)" className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                <div className="flex gap-2">
                  <button onClick={() => ctx.updateSettings({ footerLogoUrl: footerLogoInput })} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5"><Save className="w-3 h-3" /> حفظ</button>
                  {ctx.settings.footerLogoUrl && <button onClick={() => { ctx.updateSettings({ footerLogoUrl: '' }); setFooterLogoInput(''); }} className="px-5 py-2 bg-white border border-amber-200 text-amber-600 font-bold rounded-xl text-xs cursor-pointer transition">حذف</button>}
                </div>
                {(footerLogoInput || ctx.settings.footerLogoUrl) && <div className="bg-white border border-amber-100 rounded-xl p-3"><img src={convertUrl(footerLogoInput || ctx.settings.footerLogoUrl)} alt="" className="h-14 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>}
              </div>

              {/* Header Brand — Image or Text */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-green-800 flex items-center gap-1.5">✍️ تغيير اسم/شعار العلامة (بدلاً من PerfectChef)</h4>
                <p className="text-[10px] text-green-600 font-medium">اختر: صورة شعار مخصصة — أو اكتب نص بديل بلون مخصص</p>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 block">صورة الشعار (أعلى وأسفل الصفحة):</label>
                  <input value={ctx.settings.headerBrandImgUrl || ''} onChange={e => ctx.updateSettings({ headerBrandImgUrl: e.target.value })} placeholder="رابط صورة الشعار" className="w-full p-2.5 border border-green-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  {ctx.settings.headerBrandImgUrl && (
                    <div className="flex items-center gap-3">
                      <div className="bg-white border border-green-100 rounded-xl p-2"><img src={convertUrl(ctx.settings.headerBrandImgUrl)} alt="" className="h-10 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>
                      <button onClick={() => ctx.updateSettings({ headerBrandImgUrl: '' })} className="text-xs text-red-500 font-bold cursor-pointer hover:underline">حذف</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-green-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">حجم الصورة (بكسل):</label>
                    <input type="number" min={24} max={120} value={ctx.settings.brandImgSize || 48} onChange={e => ctx.updateSettings({ brandImgSize: parseInt(e.target.value) || 48 })}
                      className="w-full p-2 border border-green-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">أو اكتب نص بديل:</label>
                    <input value={ctx.settings.brandText || ''} onChange={e => ctx.updateSettings({ brandText: e.target.value })} placeholder="مثال: حلويات النخبة"
                      className="w-full p-2 border border-green-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">لون النص:</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={ctx.settings.brandTextColor || '#5c3a1e'} onChange={e => ctx.updateSettings({ brandTextColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                      <input value={ctx.settings.brandTextColor || '#5c3a1e'} onChange={e => ctx.updateSettings({ brandTextColor: e.target.value })} className="flex-1 p-2 border border-green-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم الخط (Google Fonts):</label>
                    <input value={ctx.settings.brandFont || ''} onChange={e => ctx.updateSettings({ brandFont: e.target.value })} placeholder="مثال: Cairo, Amiri, Lalezar"
                      className="w-full p-2 border border-green-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <p className="text-[9px] text-slate-400 mt-1">اكتب اسم خط Google Fonts مثل: Cairo, Amiri, Lalezar, Changa</p>
                  </div>
                </div>
                {ctx.settings.brandText && (
                  <div className="bg-white border border-green-100 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-slate-400 mb-1">معاينة:</p>
                    <span className="text-xl font-black" style={{ color: ctx.settings.brandTextColor || '#5c3a1e', fontFamily: ctx.settings.brandFont ? `'${ctx.settings.brandFont}',sans-serif` : 'inherit' }}>{ctx.settings.brandText}</span>
                  </div>
                )}
              </div>

              {/* ═══ Editable Texts ═══ */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-blue-800 flex items-center gap-1.5 mb-1"><Type className="w-4 h-4" /> تعديل النصوص والعبارات</h4>
                {([
                  { key: 'menuTitle' as const, label: 'عنوان القائمة (شريط علوي)', ph: 'قائمة الطعام' },
                  { key: 'heroTitle' as const, label: 'العنوان الرئيسي', ph: 'اكتشف أطباقنا المميزة' },
                  { key: 'heroSubtitle' as const, label: 'الوصف الفرعي', ph: 'اختر من تشكيلتنا...' },
                  { key: 'searchPlaceholder' as const, label: 'نص خانة البحث', ph: 'ابحث عن أطباق...' },
                  { key: 'categoriesLabel' as const, label: 'عنوان التصنيفات', ph: 'التصنيفات' },
                  { key: 'footerTagline' as const, label: 'عبارة أسفل الصفحة', ph: 'صُنع من شغف...' },
                  { key: 'productPopularText' as const, label: 'نص "الأكثر طلباً" عند فتح المنتج', ph: '✨ من أكثر الأطباق طلباً...' },
                  { key: 'featuredCountLabel' as const, label: 'وحدة العد في القسم المميز', ph: 'طبق' },
                  { key: 'cartEmptyText' as const, label: 'نص السلة فارغة', ph: 'السلة فارغة' },
                  { key: 'cartEmptyHint' as const, label: 'وصف السلة الفارغة', ph: 'اكتشف قائمتنا وأضف أطباقك المفضلة' },
                  { key: 'discountHint' as const, label: 'نص تحفيز الخصم ({qty}=الكمية {pct}=النسبة)', ph: 'أضف {qty} قطع للحصول على خصم {pct}%' },
                  { key: 'notePlaceholder' as const, label: 'نص الملاحظة في السلة', ph: 'مثال: حار جداً، بدون بصل...' },
                  { key: 'footerCopyright' as const, label: 'نص حقوق الفوتر', ph: 'جميع الحقوق محفوظة' },
                  { key: 'footerBadge1' as const, label: 'شارة الفوتر 1', ph: 'طلب آمن' },
                  { key: 'footerBadge2' as const, label: 'شارة الفوتر 2', ph: 'توصيل سريع' },
                  { key: 'footerBadge3' as const, label: 'شارة الفوتر 3', ph: 'ضمان الجودة' },
                  { key: 'footerContactBtn' as const, label: 'نص زر التواصل', ph: 'تواصل معنا' },
                  { key: 'footerBrandName' as const, label: 'اسم العلامة في الفوتر', ph: 'PerfectChef' },
                  { key: 'contactTitle' as const, label: 'عنوان قائمة التواصل', ph: 'اختر طريقة التواصل' },
                  { key: 'contactWhatsApp' as const, label: 'نص واتساب', ph: 'واتساب' },
                  { key: 'contactWhatsAppHint' as const, label: 'وصف واتساب', ph: 'إرسال رسالة فورية' },
                  { key: 'contactCall' as const, label: 'نص اتصال', ph: 'اتصال مباشر' },
                  { key: 'contactCallHint' as const, label: 'وصف اتصال', ph: 'اتصل الآن' },
                  { key: 'cartTitle' as const, label: 'عنوان السلة', ph: 'سلة الطلب' },
                  { key: 'cartSubtotal' as const, label: 'نص المجموع', ph: 'المجموع' },
                  { key: 'cartTax' as const, label: 'نص الضريبة', ph: 'الضريبة (15%)' },
                  { key: 'cartTotal' as const, label: 'نص الإجمالي', ph: 'الإجمالي' },
                  { key: 'cartCheckoutBtn' as const, label: 'زر إتمام الطلب', ph: 'إتمام الطلب عبر واتساب' },
                  { key: 'cartSendBtn' as const, label: 'زر إرسال الطلب', ph: 'إرسال الطلب عبر واتساب' },
                  { key: 'cartNoteBtn' as const, label: 'زر الملاحظة', ph: 'ملاحظة' },
                  { key: 'cartBackBtn' as const, label: 'زر رجوع', ph: 'رجوع' },
                  { key: 'cartOrderInfo' as const, label: 'عنوان معلومات الطلب', ph: 'معلومات الطلب' },
                  { key: 'discountValueHint' as const, label: 'نص تحفيز خصم القيمة ({val}=المبلغ {pct}=النسبة)', ph: 'اطلب بقيمة {val} ر.س واحصل على خصم {pct}%' },
                  { key: 'discountNextLabel' as const, label: 'كلمة "القادم" في شريط الخصم', ph: 'القادم' },
                  { key: 'discountReachedMsg' as const, label: 'رسالة الوصول لأعلى خصم', ph: 'مبروك! وصلت لأعلى مستوى' },
                  { key: 'discountSavedMsg' as const, label: 'كلمة "وفّرت" في الخصم', ph: 'وفّرت' },
                ]).map(f => (
                  <div key={f.key}>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">{f.label}</label>
                    <input value={editTexts[f.key]} onChange={e => setEditTexts(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                      className="w-full p-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  </div>
                ))}
                <button onClick={saveTexts} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition flex items-center gap-2"><Save className="w-3.5 h-3.5" /> حفظ النصوص</button>
              </div>

              {/* ═══ Sales Rep Card ═══ */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-800 flex items-center gap-1.5">👤 بطاقة موظف المبيعات</h4>
                  <button onClick={() => { const cur = ctx.settings.salesRep || { enabled: false, name: '', title: '', phone: '', photoUrl: '' }; ctx.updateSettings({ salesRep: { ...cur, enabled: !cur.enabled } }); setRepForm(p => ({ ...p, enabled: !p.enabled })); }}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${repForm.enabled ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all duration-300 ${repForm.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-amber-700 font-medium">تظهر بطاقتك في أعلى التطبيق مع صورتك ووظيفتك وزر تواصل مباشر</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الاسم</label><input value={repForm.name} onChange={e => setRepForm(p => ({ ...p, name: e.target.value }))} placeholder="أحمد محمد" className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" /></div>
                  <div><label className="text-[11px] font-bold text-slate-600 block mb-1">المسمّى الوظيفي</label><input value={repForm.title} onChange={e => setRepForm(p => ({ ...p, title: e.target.value }))} placeholder="مستشار المبيعات" className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" /></div>
                  <div><label className="text-[11px] font-bold text-slate-600 block mb-1">رقم الواتساب</label><input value={repForm.phone} onChange={e => setRepForm(p => ({ ...p, phone: e.target.value }))} placeholder="966500000000" className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" /></div>
                  <div><label className="text-[11px] font-bold text-slate-600 block mb-1">رابط الصورة الشخصية</label><input value={repForm.photoUrl} onChange={e => setRepForm(p => ({ ...p, photoUrl: e.target.value }))} placeholder="https://... أو Google Drive" className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" /></div>
                </div>
                {repForm.photoUrl && <div className="flex items-center gap-3 bg-white border border-amber-100 rounded-xl p-3"><img src={convertUrl(repForm.photoUrl)} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-amber-200" crossOrigin="anonymous" referrerPolicy="no-referrer" /><div><p className="text-xs font-bold text-slate-800">{repForm.name || 'الاسم'}</p><p className="text-[10px] text-slate-400">{repForm.title || 'المسمّى'}</p></div></div>}
                <button onClick={() => ctx.updateSettings({ salesRep: repForm })} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition flex items-center gap-2"><Save className="w-3.5 h-3.5" /> حفظ بطاقة المبيعات</button>
              </div>

              {/* ═══ Hero Background ═══ */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-800 flex items-center gap-1.5">🖼️ خلفية البانر الرئيسي</h4>
                  <button onClick={() => ctx.updateSettings({ heroBgEnabled: !(ctx.settings.heroBgEnabled !== false) })}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${ctx.settings.heroBgEnabled !== false ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all duration-300 ${ctx.settings.heroBgEnabled !== false ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {ctx.settings.heroBgEnabled !== false && (
                  <>
                    <p className="text-[10px] text-purple-600 font-medium">استورد صورة مخصصة أو اتركه فارغاً لاستخدام الافتراضية</p>
                    <input value={heroBgInput} onChange={e => setHeroBgInput(e.target.value)} placeholder="رابط صورة الخلفية (اختياري)" className="w-full p-2.5 border border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => ctx.updateSettings({ heroBgUrl: heroBgInput })} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5"><Save className="w-3 h-3" /> حفظ الصورة</button>
                      {ctx.settings.heroBgUrl && <button onClick={() => { ctx.updateSettings({ heroBgUrl: '' }); setHeroBgInput(''); }} className="px-4 py-2 bg-white border border-purple-200 text-purple-600 font-bold rounded-xl text-xs cursor-pointer transition">استخدام الافتراضية</button>}
                      <button onClick={() => { ctx.updateSettings({ heroBgUrl: '', heroBgEnabled: false }); setHeroBgInput(''); }} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-bold rounded-xl text-xs cursor-pointer transition">🗑️ حذف الخلفية بالكامل</button>
                    </div>
                    {(heroBgInput || ctx.settings.heroBgUrl) && <div className="bg-white border border-purple-100 rounded-xl p-2"><img src={convertUrl(heroBgInput || ctx.settings.heroBgUrl)} alt="" className="w-full h-24 object-cover rounded-lg" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>}
                  </>
                )}
                {ctx.settings.heroBgEnabled === false && <p className="text-[10px] text-slate-400 font-medium text-center py-2">❌ الخلفية محذوفة — فعّل الزر لإعادتها</p>}
              </div>

              {/* ═══ Content Background ═══ */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-teal-800 flex items-center gap-1.5">🎨 خلفية صفحة الأصناف والفوتر</h4>
                  <button onClick={() => ctx.updateSettings({ contentBgEnabled: !(ctx.settings.contentBgEnabled !== false) })}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${ctx.settings.contentBgEnabled !== false ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all duration-300 ${ctx.settings.contentBgEnabled !== false ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {ctx.settings.contentBgEnabled !== false && (
                  <>
                    <p className="text-[10px] text-teal-600 font-medium">صورة خافتة خلف المنتجات وأسفل الصفحة</p>
                    <input value={contentBgInput} onChange={e => setContentBgInput(e.target.value)} placeholder="رابط صورة الخلفية (اختياري)" className="w-full p-2.5 border border-teal-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => ctx.updateSettings({ contentBgUrl: contentBgInput })} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5"><Save className="w-3 h-3" /> حفظ الصورة</button>
                      {ctx.settings.contentBgUrl && <button onClick={() => { ctx.updateSettings({ contentBgUrl: '' }); setContentBgInput(''); }} className="px-4 py-2 bg-white border border-teal-200 text-teal-600 font-bold rounded-xl text-xs cursor-pointer transition">استخدام الافتراضية</button>}
                      <button onClick={() => { ctx.updateSettings({ contentBgUrl: '', contentBgEnabled: false }); setContentBgInput(''); }} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-bold rounded-xl text-xs cursor-pointer transition">🗑️ حذف الخلفية بالكامل</button>
                    </div>
                    {(contentBgInput || ctx.settings.contentBgUrl) && <div className="bg-white border border-teal-100 rounded-xl p-2"><img src={convertUrl(contentBgInput || ctx.settings.contentBgUrl)} alt="" className="w-full h-24 object-cover rounded-lg opacity-60" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>}
                  </>
                )}
                {ctx.settings.contentBgEnabled === false && <p className="text-[10px] text-slate-400 font-medium text-center py-2">❌ الخلفية محذوفة — فعّل الزر لإعادتها</p>}
              </div>

              {/* ═══ Footer Background ═══ */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-800 flex items-center gap-1.5">🎨 خلفية أسفل الصفحة (الفوتر)</h4>
                  <button onClick={() => ctx.updateSettings({ footerBgEnabled: !(ctx.settings.footerBgEnabled !== false) })}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${ctx.settings.footerBgEnabled !== false ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all duration-300 ${ctx.settings.footerBgEnabled !== false ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {ctx.settings.footerBgEnabled !== false && (
                  <>
                    <p className="text-[10px] text-indigo-600 font-medium">صورة خلفية مستقلة للفوتر — اتركه فارغاً لاستخدام نفس خلفية الأصناف</p>
                    <input value={footerBgInput} onChange={e => setFooterBgInput(e.target.value)} placeholder="رابط صورة خلفية الفوتر (اختياري)" className="w-full p-2.5 border border-indigo-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => ctx.updateSettings({ footerBgUrl: footerBgInput })} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5"><Save className="w-3 h-3" /> حفظ الصورة</button>
                      {ctx.settings.footerBgUrl && <button onClick={() => { ctx.updateSettings({ footerBgUrl: '' }); setFooterBgInput(''); }} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl text-xs cursor-pointer transition">استخدام خلفية الأصناف</button>}
                      <button onClick={() => { ctx.updateSettings({ footerBgUrl: '', footerBgEnabled: false }); setFooterBgInput(''); }} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-bold rounded-xl text-xs cursor-pointer transition">🗑️ حذف بالكامل</button>
                    </div>
                    {(footerBgInput || ctx.settings.footerBgUrl) && <div className="bg-white border border-indigo-100 rounded-xl p-2"><img src={convertUrl(footerBgInput || ctx.settings.footerBgUrl)} alt="" className="w-full h-24 object-cover rounded-lg opacity-60" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>}
                  </>
                )}
                {ctx.settings.footerBgEnabled === false && <p className="text-[10px] text-slate-400 font-medium text-center py-2">❌ الخلفية محذوفة — فعّل الزر لإعادتها</p>}
              </div>
            </div>
          )}

          {/* ═══ IMPORT/EXPORT TAB ═══ */}
          {tab === 'importexport' && (
            <div className="space-y-5 animate-slideUp max-w-2xl mx-auto">
              {importStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-2xl border ${importStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  {importStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span className="text-xs font-bold">{importStatus.msg}</span>
                  <button onClick={() => setImportStatus(null)} className="mr-auto p-1 hover:bg-black/5 rounded cursor-pointer"><X className="w-3 h-3" /></button>
                </div>
              )}

              {/* ★ Excel Export ★ */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md"><FileSpreadsheet className="w-6 h-6" /></div>
                  <div><h3 className="text-sm font-black text-slate-800">📊 تصدير إلى Excel</h3><p className="text-[11px] text-slate-500 font-medium">ملف Excel منظم بـ 6 شيتات — سهل التعديل</p></div>
                </div>
                <div className="bg-white border border-green-100 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5">
                  <p className="font-bold text-green-800">📋 الملف يحتوي على 6 شيتات:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['📦 المنتجات — كل الأصناف وتفاصيلها','📂 التصنيفات — الفئات وصورها','📝 النصوص — كل العبارات في التطبيق','🏷️ الفلاتر الغذائية — التصنيفات الغذائية','🎁 الخصومات — مستويات خصم الكمية','⚙️ الإعدادات — اللوجو والواتساب'].map((t,i) => (
                      <span key={i} className="bg-green-50 px-2 py-1 rounded-lg border border-green-100 text-[10px] font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => { exportToExcel(ctx.categories, ctx.menuItems, ctx.settings); setImportStatus({ type: 'success', msg: '✅ تم تصدير ملف Excel بنجاح!' }); }}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-105 active:scale-[0.98] text-white font-black rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm">
                  <FileDown className="w-4 h-4" /> تحميل ملف Excel
                </button>
              </div>

              {/* ★ Excel Import ★ */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><FileUp className="w-6 h-6" /></div>
                  <div><h3 className="text-sm font-black text-slate-800">📥 استيراد من Excel</h3><p className="text-[11px] text-slate-500 font-medium">استيراد ملف Excel معدّل — يُضاف ويُحدّث تلقائياً</p></div>
                </div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-blue-800">💡 طريقة الاستخدام:</p>
                  <ol className="space-y-0.5 mr-4 list-decimal">
                    <li>صدّر الملف أولاً لتحصل على القالب الصحيح</li>
                    <li>افتحه بـ Excel أو Google Sheets</li>
                    <li>عدّل أو أضف صفوف جديدة في أي شيت</li>
                    <li>احفظ كملف <strong>.xlsx</strong> ثم ارفعه هنا</li>
                  </ol>
                </div>
                <label className="block">
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    try {
                      const result = await importFromExcel(file);
                      // Smart merge categories — keep existing, update matching IDs, add new
                      if (result.categories.length > 0) {
                        const merged = [...ctx.categories];
                        result.categories.forEach(c => {
                          const idx = merged.findIndex(x => x.id === c.id);
                          if (idx !== -1) merged[idx] = { ...merged[idx], ...c };
                          else merged.push(c);
                        });
                        ctx.replaceCategories(merged);
                      }
                      // Smart merge items
                      if (result.menuItems.length > 0) {
                        const merged = [...ctx.menuItems];
                        result.menuItems.forEach(m => {
                          const idx = merged.findIndex(x => x.id === m.id);
                          if (idx !== -1) merged[idx] = { ...merged[idx], ...m };
                          else merged.push(m);
                        });
                        ctx.replaceMenuItems(merged);
                      }
                      // Apply texts
                      if (Object.keys(result.texts).length > 0) { const cur = ctx.settings.texts || DEFAULT_TEXTS; ctx.updateSettings({ texts: { ...cur, ...result.texts } }); }
                      // Apply dietary filters
                      if (result.dietaryFilters.length > 0) ctx.updateSettings({ dietaryFilters: result.dietaryFilters });
                      // Apply discount tiers
                      if (result.discountTiers.length > 0) ctx.updateSettings({ discountTiers: result.discountTiers });
                      // Apply general settings
                      const gs = result.generalSettings;
                      if (gs['logoUrl']) ctx.updateSettings({ logoUrl: gs['logoUrl'] });
                      if (gs['whatsappNumber']) ctx.updateSettings({ whatsappNumber: gs['whatsappNumber'] });
                      if (gs['discountEnabled']) ctx.updateSettings({ discountEnabled: gs['discountEnabled'] === 'نعم' });
                      if (gs['featured.title'] || gs['featured.enabled']) {
                        const fc = ctx.settings.featured || featuredCfg;
                        ctx.updateSettings({ featured: { ...fc, title: gs['featured.title'] || fc.title, subtitle: gs['featured.subtitle'] || fc.subtitle, enabled: gs['featured.enabled'] ? gs['featured.enabled'] === 'نعم' : fc.enabled, style: (gs['featured.style'] as 'scroll'|'grid') || fc.style } });
                      }
                      // Sales Rep
                      if (gs['salesRep.name'] || gs['salesRep.enabled']) {
                        const sr = ctx.settings.salesRep || { enabled: false, name: '', title: '', phone: '', photoUrl: '' };
                        ctx.updateSettings({ salesRep: { ...sr, enabled: gs['salesRep.enabled'] ? gs['salesRep.enabled'] === 'نعم' : sr.enabled, name: gs['salesRep.name'] || sr.name, title: gs['salesRep.title'] || sr.title, phone: gs['salesRep.phone'] || sr.phone, photoUrl: gs['salesRep.photoUrl'] || sr.photoUrl } });
                      }
                      // Backgrounds
                      if (gs['heroBgUrl'] !== undefined) ctx.updateSettings({ heroBgUrl: gs['heroBgUrl'] });
                      if (gs['heroBgEnabled']) ctx.updateSettings({ heroBgEnabled: gs['heroBgEnabled'] === 'نعم' });
                      if (gs['contentBgUrl'] !== undefined) ctx.updateSettings({ contentBgUrl: gs['contentBgUrl'] });
                      if (gs['contentBgEnabled']) ctx.updateSettings({ contentBgEnabled: gs['contentBgEnabled'] === 'نعم' });
                      if (gs['footerBgUrl'] !== undefined) ctx.updateSettings({ footerBgUrl: gs['footerBgUrl'] });
                      if (gs['footerBgEnabled']) ctx.updateSettings({ footerBgEnabled: gs['footerBgEnabled'] === 'نعم' });
                      if (gs['footerLogoUrl'] !== undefined) ctx.updateSettings({ footerLogoUrl: gs['footerLogoUrl'] });
                      if (gs['headerBrandImgUrl'] !== undefined) ctx.updateSettings({ headerBrandImgUrl: gs['headerBrandImgUrl'] });
                      if (gs['brandText'] !== undefined) ctx.updateSettings({ brandText: gs['brandText'] });
                      if (gs['brandTextColor']) ctx.updateSettings({ brandTextColor: gs['brandTextColor'] });
                      if (gs['brandFont']) ctx.updateSettings({ brandFont: gs['brandFont'] });
                      if (gs['brandImgSize']) ctx.updateSettings({ brandImgSize: parseInt(gs['brandImgSize']) || 48 });
                      if (gs['recommendations.enabled'] || gs['recommendations.title']) {
                        const r = ctx.settings.recommendations || { enabled: true, title: '' };
                        ctx.updateSettings({ recommendations: { ...r, enabled: gs['recommendations.enabled'] ? gs['recommendations.enabled'] === 'نعم' : r.enabled, title: gs['recommendations.title'] || r.title } });
                      }
                      if (gs['flashDeals.enabled']) ctx.updateSettings({ flashDeals: { ...ctx.settings.flashDeals, enabled: gs['flashDeals.enabled'] === 'نعم' } });
                      setImportStatus({ type: 'success', msg: `✅ تم الاستيراد! ${result.stats.cats} تصنيف، ${result.stats.items} منتج، ${result.stats.texts} نص، ${result.stats.diets} فلتر، ${result.stats.tiers} مستوى خصم` });
                    } catch (err) { setImportStatus({ type: 'error', msg: `❌ ${err instanceof Error ? err.message : 'خطأ في القراءة'}` }); }
                    e.target.value = '';
                  }} />
                  <div className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-105 active:scale-[0.98] text-white font-black rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm">
                    <FileUp className="w-4 h-4" /> استيراد ملف Excel (.xlsx)
                  </div>
                </label>
              </div>

              {/* ★ Full Replace from Excel ★ */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-md"><AlertTriangle className="w-5 h-5" /></div>
                  <div><h3 className="text-sm font-black text-slate-800">🔄 استبدال كامل من Excel</h3><p className="text-[11px] text-slate-500 font-medium">حذف كل البيانات واستبدالها من ملف Excel</p></div>
                </div>
                <label className="block">
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    if (!confirm('⚠️ سيتم حذف جميع البيانات واستبدالها!\n\nهل أنت متأكد؟')) { e.target.value = ''; return; }
                    try {
                      const result = await importFromExcel(file);
                      localStorage.setItem('pc_categories', JSON.stringify(result.categories));
                      localStorage.setItem('pc_menuItems', JSON.stringify(result.menuItems));
                      const newSettings = { ...ctx.settings };
                      if (Object.keys(result.texts).length > 0) newSettings.texts = { ...DEFAULT_TEXTS, ...result.texts };
                      if (result.dietaryFilters.length > 0) newSettings.dietaryFilters = result.dietaryFilters;
                      if (result.discountTiers.length > 0) newSettings.discountTiers = result.discountTiers;
                      const gs = result.generalSettings;
                      if (gs['logoUrl']) newSettings.logoUrl = gs['logoUrl'];
                      if (gs['whatsappNumber']) newSettings.whatsappNumber = gs['whatsappNumber'];
                      localStorage.setItem('pc_settings_v3', JSON.stringify(newSettings));
                      setImportStatus({ type: 'success', msg: '✅ تم الاستبدال! جاري إعادة التحميل...' });
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (err) { setImportStatus({ type: 'error', msg: `❌ ${err instanceof Error ? err.message : 'خطأ'}` }); }
                    e.target.value = '';
                  }} />
                  <div className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-105 active:scale-[0.98] text-white font-black rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" /> استبدال كامل من Excel
                  </div>
                </label>
              </div>

              {/* Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-700">📖 دليل ملف Excel</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1">
                    <p className="font-bold text-green-700">📦 شيت المنتجات</p>
                    <p>كل صف = منتج واحد. الأعمدة: ID، الاسم، التصنيف، السعر، الوصف، السعرات، الشارة، الصور (3 أعمدة)، الفلاتر الغذائية</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1">
                    <p className="font-bold text-blue-700">📂 شيت التصنيفات</p>
                    <p>كل صف = تصنيف. الأعمدة: ID، الاسم، الوصف، رابط الصورة، نوع الأيقونة، طريقة العرض</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1">
                    <p className="font-bold text-purple-700">📝 شيت النصوص</p>
                    <p>كل صف = عبارة. غيّر عمود "القيمة" لتعديل أي نص في التطبيق</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1">
                    <p className="font-bold text-amber-700">⚙️ شيت الإعدادات</p>
                    <p>اللوجو، رقم الواتساب، تفعيل الخصم، القسم المميز</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ CATEGORIES TAB ═══ */}
          {tab === 'categories' && (
            <div className="space-y-4 animate-slideUp">
              <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-700">التصنيفات ({ctx.categories.length})</h3><button onClick={() => { resetCatForm(); setCatForm({ displayMode: 'image-name', emojiType: 'image' }); setShowCatForm(true); }} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer transition"><Plus className="w-3.5 h-3.5" /> إضافة</button></div>
              {showCatForm && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-scaleIn">
                  <h4 className="text-sm font-bold text-amber-800">{editingCatId ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">{catForm.displayMode === 'image-only' ? '📝 اسم التصنيف (يظهر أسفل الصورة المصغرة)' : '📝 اسم التصنيف *'}</label>
                    <input placeholder={catForm.displayMode === 'image-only' ? 'مثال: شوكولا، كيك...' : 'اسم التصنيف'} value={catForm.name||''} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <input placeholder="الوصف (اختياري)" value={catForm.description||''} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  {/* Image URL */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">رابط صورة التصنيف:</label>
                    <input placeholder="https://... أو Google Drive" value={catForm.emoji||''} onChange={e => setCatForm(p => ({ ...p, emoji: e.target.value, emojiType: 'image' }))} className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    {catForm.emoji && <div className="mt-2 flex items-center gap-3"><span className="text-[10px] text-slate-500 font-bold">معاينة:</span><img src={convertUrl(catForm.emoji)} alt="" className="w-10 h-10 object-contain rounded-lg" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>}
                  </div>
                  {/* Display Mode */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1.5">طريقة العرض:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([['image-only','🖼️ صورة فقط'] as const,['image-name','🖼️ صورة + اسم'] as const,['name-only','📝 اسم فقط'] as const]).map(([v,l]) => (
                        <button key={v} type="button" onClick={() => setCatForm(p => ({ ...p, displayMode: v }))}
                          className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${(catForm.displayMode || 'image-name') === v ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2"><button onClick={handleSaveCategory} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition flex items-center justify-center gap-2"><Save className="w-3.5 h-3.5" /> حفظ</button><button onClick={resetCatForm} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm cursor-pointer transition hover:bg-slate-50">إلغاء</button></div>
                </div>
              )}
              <div className="grid gap-2">{ctx.categories.map(cat => {
                const isImgCat = (cat.emojiType === 'image' || /^https?:\/\//i.test(cat.emoji || '')) && cat.emoji;
                const imgSize = cat.displayMode === 'image-only' ? 72 : 48;
                return (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    {isImgCat ? (
                      <div className="shrink-0 rounded-2xl overflow-hidden border-2 border-amber-200/50 shadow-md" style={{ width: imgSize, height: imgSize }}>
                        <img src={convertUrl(cat.emoji)} alt={cat.name} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" style={{ filter: 'contrast(1.02) saturate(1.05) brightness(1.01)' }} />
                      </div>
                    ) : <span className="text-3xl">{cat.emoji || '🍴'}</span>}
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{cat.name || <span className="text-slate-400 italic">بدون اسم</span>}</h4>
                      <div className="flex items-center gap-2"><p className="text-[11px] text-slate-400">{cat.description}</p><span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">{cat.displayMode === 'image-only' ? '🖼️ صورة فقط' : cat.displayMode === 'name-only' ? '📝 اسم فقط' : '🖼️+📝'}</span></div>
                    </div>
                  </div>
                   <div className="flex items-center gap-1">
                     <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-bold">{ctx.menuItems.filter(m => m.category === cat.id).length}</span>
                     <button onClick={() => moveCat(cat.id, -1)} className="p-1.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer" title="تحريك لأعلى"><ArrowUp className="w-3.5 h-3.5" /></button>
                     <button onClick={() => moveCat(cat.id, 1)} className="p-1.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer" title="تحريك لأسفل"><ArrowDown className="w-3.5 h-3.5" /></button>
                     <button onClick={() => startEditCat(cat)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                     <button onClick={() => { if (confirm('حذف التصنيف؟')) ctx.deleteCategory(cat.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                   </div>
                </div>
              ); })}</div>
            </div>
          )}

          {/* ═══ PRODUCTS TAB ═══ */}
          {tab === 'products' && (
            <div className="space-y-4 animate-slideUp">
              <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-700">المنتجات ({ctx.menuItems.length})</h3><button onClick={() => { resetProdForm(); setProdForm({ dietary: [], images: [], colorClass: COLOR_OPTIONS[0], showCalories: true, showPrepTime: true, showQuality: true }); setShowProdForm(true); }} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer transition"><Plus className="w-3.5 h-3.5" /> إضافة منتج</button></div>
              {showProdForm && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4 animate-scaleIn">
                  <h4 className="text-sm font-bold text-amber-800">{editingProdId ? 'تعديل' : 'إضافة منتج جديد'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="اسم المنتج بالعربي *" value={prodForm.name||''} onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <input placeholder="Product Name in English" value={prodForm.nameEn||''} onChange={e => setProdForm(p => ({ ...p, nameEn: e.target.value }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 italic" style={{ direction: 'ltr', fontFamily: "'Playfair Display', serif" }} />
                    <input placeholder="كود الصنف (SKU)" value={prodForm.sku||''} onChange={e => setProdForm(p => ({ ...p, sku: e.target.value }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 font-mono" />
                    <select value={prodForm.category||''} onChange={e => setProdForm(p => ({ ...p, category: e.target.value }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 cursor-pointer"><option value="">التصنيف *</option>{ctx.categories.map(c => <option key={c.id} value={c.id}>{getCategoryLabel(c)}</option>)}</select>
                    <input type="number" placeholder="السعر (ر.س) *" value={prodForm.price||''} onChange={e => setProdForm(p => ({ ...p, price: parseFloat(e.target.value)||0 }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <input type="number" placeholder="السعرات" value={prodForm.calories||''} onChange={e => setProdForm(p => ({ ...p, calories: parseInt(e.target.value)||0 }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <input placeholder="شارة (اختياري)" value={prodForm.badge||''} onChange={e => setProdForm(p => ({ ...p, badge: e.target.value }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <label className="flex items-center gap-2 p-2.5 cursor-pointer"><input type="checkbox" checked={prodForm.featured||false} onChange={e => setProdForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-amber-500" /><span className="text-sm font-bold text-slate-700">مميز ⭐</span></label>
                    <label className="flex items-center gap-2 p-2.5 cursor-pointer"><input type="checkbox" checked={prodForm.outOfStock||false} onChange={e => setProdForm(p => ({ ...p, outOfStock: e.target.checked }))} className="w-4 h-4 accent-red-500" /><span className="text-sm font-bold text-red-600">نفذ المخزون 🚫</span></label>
                  </div>
                  <textarea placeholder="الوصف" value={prodForm.description||''} onChange={e => setProdForm(p => ({ ...p, description: e.target.value }))} className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 h-20 resize-none" />
                  <div><label className="text-xs font-bold text-slate-600 mb-1 block">لون الخلفية (للمنتجات بدون صورة):</label><div className="flex flex-wrap gap-1.5">{COLOR_OPTIONS.map(c => (<button key={c} type="button" onClick={() => setProdForm(p => ({ ...p, colorClass: c }))} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} border-2 transition cursor-pointer ${prodForm.colorClass === c ? 'border-amber-500 scale-110' : 'border-slate-200'}`} />))}</div></div>
                  <div><label className="text-xs font-bold text-slate-600 mb-1 block">الفلاتر الغذائية:</label><div className="flex flex-wrap gap-1.5">{dietaryFilters.map(d => (<button key={d.id} type="button" onClick={() => toggleDiet(d.id)} className={`text-xs px-2.5 py-1.5 rounded-xl border font-bold cursor-pointer transition ${(prodForm.dietary||[]).includes(d.id) ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-slate-200 text-slate-600'}`}>{d.icon} {d.label}</button>))}</div></div>
                  {/* Images */}
                  <div><label className="text-xs font-bold text-slate-600 mb-1 block flex items-center gap-1"><Image className="w-3.5 h-3.5" /> صور المنتج:</label>
                    <div className="flex gap-2"><input placeholder="رابط الصورة" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-1 p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" /><button onClick={addImage} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer transition">إضافة</button></div>
                    {(prodForm.images||[]).length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{(prodForm.images||[]).map((img,i) => (<div key={i} className="relative group"><img src={convertUrl(img)} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200" crossOrigin="anonymous" referrerPolicy="no-referrer" /><button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"><X className="w-3 h-3" /></button></div>))}</div>)}</div>
                  {/* Unit & Packaging */}
                  <div className="bg-white border border-amber-100 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-700 border-b border-slate-100 pb-2">📦 الوحدة والتعبئة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">⚖️ وحدة البيع</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {['قطعة','حبة','علبة','كيلو','نصف كيلو','ربع كيلو','لتر','كوب'].map(u => (
                            <button key={u} type="button" onClick={() => setProdForm(p => ({ ...p, unit: u }))}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition ${prodForm.unit === u ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{u}</button>
                          ))}
                        </div>
                        <input placeholder="أو اكتب وحدة مخصصة..." value={prodForm.unit||''} onChange={e => setProdForm(p => ({ ...p, unit: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">🎁 نوع التعبئة</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {['علبة كرتون','صندوق هدايا','كيس','علبة بلاستيك','ورق تغليف','بدون'].map(p => (
                            <button key={p} type="button" onClick={() => setProdForm(prev => ({ ...prev, packaging: p }))}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition ${prodForm.packaging === p ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                          ))}
                        </div>
                        <input placeholder="أو اكتب تعبئة مخصصة..." value={prodForm.packaging||''} onChange={e => setProdForm(p => ({ ...p, packaging: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500" />
                      </div>
                    </div>
                  </div>

                  {/* Customization Groups (Option Groups) */}
                  <div className="bg-white border border-blue-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black text-slate-700">🎛️ خيارات التخصيص</h4>
                      <button type="button" onClick={() => {
                        const groups = [...(prodForm.optionGroups || [])];
                        groups.push({ id: `og-${Date.now()}`, name: '', minSelection: 0, maxSelection: 1, options: [] });
                        setProdForm(p => ({ ...p, optionGroups: groups }));
                      }} className="text-[10px] font-bold px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition flex items-center gap-1">
                        <Plus className="w-3 h-3" /> إضافة مجموعة
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">مثل: اختر الحجم، إضافات، نوع الشوكولا — كل مجموعة تحتوي خيارات يختار منها العميل</p>

                    {(prodForm.optionGroups || []).map((group, gIdx) => (
                      <div key={group.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input placeholder="اسم المجموعة (مثال: اختر الحجم)" value={group.name}
                            onChange={e => { const gs = [...(prodForm.optionGroups || [])]; gs[gIdx] = { ...gs[gIdx], name: e.target.value }; setProdForm(p => ({ ...p, optionGroups: gs })); }}
                            className="flex-1 p-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:border-amber-500" />
                          <button type="button" onClick={() => { const gs = (prodForm.optionGroups || []).filter((_,i) => i !== gIdx); setProdForm(p => ({ ...p, optionGroups: gs })); }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 shrink-0">الحد الأدنى:</label>
                            <input type="number" min={0} value={group.minSelection}
                              onChange={e => { const gs = [...(prodForm.optionGroups || [])]; gs[gIdx] = { ...gs[gIdx], minSelection: parseInt(e.target.value) || 0 }; setProdForm(p => ({ ...p, optionGroups: gs })); }}
                              className="w-14 p-1.5 border border-blue-200 rounded-lg text-xs bg-white text-center focus:outline-none focus:border-amber-500" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 shrink-0">الحد الأقصى:</label>
                            <input type="number" min={1} value={group.maxSelection}
                              onChange={e => { const gs = [...(prodForm.optionGroups || [])]; gs[gIdx] = { ...gs[gIdx], maxSelection: parseInt(e.target.value) || 1 }; setProdForm(p => ({ ...p, optionGroups: gs })); }}
                              className="w-14 p-1.5 border border-blue-200 rounded-lg text-xs bg-white text-center focus:outline-none focus:border-amber-500" />
                          </div>
                        </div>

                        {/* Options list */}
                        <div className="space-y-1">
                          {group.options.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-blue-100">
                              <input placeholder="اسم الخيار" value={opt.name}
                                onChange={e => { const gs = [...(prodForm.optionGroups || [])]; const opts = [...gs[gIdx].options]; opts[oIdx] = { ...opts[oIdx], name: e.target.value }; gs[gIdx] = { ...gs[gIdx], options: opts }; setProdForm(p => ({ ...p, optionGroups: gs })); }}
                                className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-amber-500" />
                              <div className="flex items-center gap-1">
                                <input type="number" placeholder="السعر" value={opt.price || ''}
                                  onChange={e => { const gs = [...(prodForm.optionGroups || [])]; const opts = [...gs[gIdx].options]; opts[oIdx] = { ...opts[oIdx], price: parseFloat(e.target.value) || 0 }; gs[gIdx] = { ...gs[gIdx], options: opts }; setProdForm(p => ({ ...p, optionGroups: gs })); }}
                                  className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-center focus:outline-none focus:border-amber-500" />
                                <span className="text-[9px] text-slate-400 font-bold">ر.س</span>
                              </div>
                              <button type="button" onClick={() => { const gs = [...(prodForm.optionGroups || [])]; const opts = gs[gIdx].options.filter((_,i) => i !== oIdx); gs[gIdx] = { ...gs[gIdx], options: opts }; setProdForm(p => ({ ...p, optionGroups: gs })); }}
                                className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>

                        <button type="button" onClick={() => {
                          const gs = [...(prodForm.optionGroups || [])];
                          const opts = [...gs[gIdx].options, { id: `opt-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, name: '', price: 0 }];
                          gs[gIdx] = { ...gs[gIdx], options: opts };
                          setProdForm(p => ({ ...p, optionGroups: gs }));
                        }} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                          <Plus className="w-3 h-3" /> إضافة خيار
                        </button>
                      </div>
                    ))}

                    {(prodForm.optionGroups || []).length === 0 && (
                      <p className="text-[10px] text-slate-400 font-medium text-center py-3">لا توجد مجموعات تخصيص — اضغط "إضافة مجموعة" لإنشاء خيارات</p>
                    )}
                  </div>

                  {/* Info fields */}
                  <div className="bg-white border border-amber-100 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-700 border-b border-slate-100 pb-2">📋 معلومات إضافية</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="text-[11px] font-bold text-slate-600 block mb-1">⏱️ وقت الاستلام</label><input placeholder="٥-١٥ دقيقة" value={prodForm.prepTime||''} onChange={e => setProdForm(p => ({ ...p, prepTime: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500" /></div>
                      <div><label className="text-[11px] font-bold text-slate-600 block mb-1">🏆 وصف الجودة</label><input placeholder="جودة فاخرة" value={prodForm.qualityLabel||''} onChange={e => setProdForm(p => ({ ...p, qualityLabel: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500" /></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {([['showCalories','🔥 السعرات'] as const,['showPrepTime','⏱️ وقت الاستلام'] as const,['showQuality','🏆 وصف الجودة'] as const]).map(([k,l]) => (
                        <label key={k} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                          <input type="checkbox" checked={(prodForm as Record<string,unknown>)[k] !== false} onChange={e => setProdForm(p => ({ ...p, [k]: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                          <span className="text-xs font-bold text-slate-700">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2"><button onClick={handleSaveProduct} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition flex items-center justify-center gap-2"><Save className="w-3.5 h-3.5" /> حفظ</button><button onClick={resetProdForm} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm cursor-pointer transition hover:bg-slate-50">إلغاء</button></div>
                </div>
              )}
              {/* Products grouped by category */}
              <div className="space-y-4">
                {ctx.categories.map(cat => {
                  const catItems = ctx.menuItems.filter(m => m.category === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">{cat.name || 'بدون تصنيف'}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{catItems.length} منتج</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                      <div className="grid gap-1.5">
                        {catItems.map(m => (
                          <div key={m.id}
                            draggable
                            onDragStart={() => setDragId(m.id)}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => handleDrop(m.id)}
                            className={`flex items-center justify-between p-2.5 border rounded-xl transition cursor-grab active:cursor-grabbing ${dragId === m.id ? 'border-amber-400 bg-amber-50 opacity-60' : m.hidden ? 'border-dashed border-slate-300 bg-slate-50 opacity-50' : 'bg-white border-slate-100 hover:shadow-sm'}`}>
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              {m.images && m.images.length > 0 ? <img src={convertUrl(m.images[0])} alt="" className="w-9 h-9 object-cover rounded-lg shrink-0" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : <span className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-black shrink-0">{m.name.charAt(0)}</span>}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">{m.name}</h4>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] text-amber-600 font-extrabold">{m.price.toFixed(0)} ر.س</span>
                                  {m.hidden && <span className="text-[8px] px-1 py-0.5 bg-slate-200 text-slate-600 rounded font-bold">مخفي</span>}
                                  {m.outOfStock && <span className="text-[8px] px-1 py-0.5 bg-red-100 text-red-700 rounded font-bold">نفذ</span>}
                                  {isFeatured(m.id) && <span className="text-[8px] px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">⭐</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button onClick={() => ctx.updateMenuItem(m.id, { hidden: !m.hidden })} className={`p-1 rounded transition cursor-pointer ${m.hidden ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`} title={m.hidden ? 'إظهار' : 'إخفاء'}>{m.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}</button>
                              <button onClick={() => moveProd(m.id, -1)} className="p-1 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer" title="لأعلى"><ArrowUp className="w-3 h-3" /></button>
                              <button onClick={() => moveProd(m.id, 1)} className="p-1 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer" title="لأسفل"><ArrowDown className="w-3 h-3" /></button>
                              <button onClick={() => startEditProd(m)} className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"><Pencil className="w-3 h-3" /></button>
                              <button onClick={() => { if (confirm('حذف؟')) ctx.deleteMenuItem(m.id); }} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Uncategorized items */}
                {ctx.menuItems.filter(m => !ctx.categories.find(c => c.id === m.category)).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">بدون تصنيف</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid gap-1.5">
                      {ctx.menuItems.filter(m => !ctx.categories.find(c => c.id === m.category)).map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-2.5"><span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black shrink-0">{m.name.charAt(0)}</span><span className="text-xs font-bold text-slate-800">{m.name}</span></div>
                          <div className="flex items-center gap-0.5"><button onClick={() => startEditProd(m)} className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"><Pencil className="w-3 h-3" /></button><button onClick={() => { if (confirm('حذف؟')) ctx.deleteMenuItem(m.id); }} className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"><Trash2 className="w-3 h-3" /></button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ FEATURED TAB ═══ */}
          {tab === 'featured' && (
            <div className="space-y-5 animate-slideUp max-w-2xl mx-auto">
              <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md"><Star className="w-5 h-5 fill-white" /></div><div><h3 className="text-sm font-black text-slate-800">القسم المميز</h3></div></div>
                <button onClick={() => ctx.updateSettings({ featured: { ...featuredCfg, enabled: !featuredCfg.enabled } })} className={`w-14 h-7 rounded-full relative transition-all duration-300 cursor-pointer ${featuredCfg.enabled ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${featuredCfg.enabled ? 'right-1' : 'left-1'}`} /></button>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                <input value={featTitle} onChange={e => setFeatTitle(e.target.value)} placeholder="عنوان القسم" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500 font-bold" />
                <input value={featSubtitle} onChange={e => setFeatSubtitle(e.target.value)} placeholder="وصف (اختياري)" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-amber-500" />
                <div className="flex gap-2">
                  <button onClick={() => ctx.updateSettings({ featured: { ...featuredCfg, title: featTitle, subtitle: featSubtitle } })} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer transition"><Save className="w-3.5 h-3.5 inline mr-1" /> حفظ</button>
                  <button onClick={() => ctx.updateSettings({ featured: { ...featuredCfg, style: featuredCfg.style === 'scroll' ? 'grid' : 'scroll' } })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition">{featuredCfg.style === 'scroll' ? <><LayoutGrid className="w-3.5 h-3.5 inline mr-1" /> تحويل لشبكة</> : <><GripHorizontal className="w-3.5 h-3.5 inline mr-1" /> تحويل لتمرير</>}</button>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-700 border-b border-slate-100 pb-2">اختيار الأصناف ({currentIds.length})</h4>
                {currentIds.length > 0 && currentIds.map((id, idx) => { const item = ctx.menuItems.find(m => m.id === id); if (!item) return null; return (
                  <div key={id} className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2.5"><span className="text-xs font-black text-amber-600 bg-amber-100 w-6 h-6 rounded-lg flex items-center justify-center">{idx+1}</span><span className="text-xs font-bold text-slate-800">{item.name}</span><span className="text-[10px] text-amber-600 font-bold">{item.price} ر.س</span></div>
                    <div className="flex items-center gap-1"><button onClick={() => moveFeatured(id,-1)} disabled={idx===0} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg cursor-pointer disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button><button onClick={() => moveFeatured(id,1)} disabled={idx===currentIds.length-1} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg cursor-pointer disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button><button onClick={() => toggleFeaturedItem(id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button></div>
                  </div>
                ); })}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto mt-2">{ctx.menuItems.map(m => (
                  <button key={m.id} onClick={() => toggleFeaturedItem(m.id)} className={`flex items-center gap-2 p-2.5 border rounded-xl text-left transition cursor-pointer ${isFeatured(m.id) ? 'bg-amber-50 border-amber-400' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isFeatured(m.id) ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>{isFeatured(m.id) && <Star className="w-3 h-3 fill-white" />}</div>
                    <span className="text-xs font-bold text-slate-800 truncate flex-1">{m.name}</span><span className="text-[10px] text-amber-600 font-bold shrink-0">{m.price} ر.س</span>
                  </button>
                ))}</div>
              </div>
            </div>
          )}

          {/* ═══ DIETARY TAB ═══ */}
          {tab === 'dietary' && (
            <div className="space-y-4 animate-slideUp max-w-2xl mx-auto">
              <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-700">الفلاتر ({dietaryFilters.length})</h3>
                <button onClick={() => { resetDietForm(); setDietForm({ enabled: true, iconType: 'emoji' }); setShowDietForm(true); }} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer transition"><Plus className="w-3.5 h-3.5" /> إضافة</button></div>
              {showDietForm && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-scaleIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="text-[11px] font-bold text-slate-600 block mb-1">ID *</label><input placeholder="HALAL" value={dietForm.id||''} disabled={!!editingDietId} onChange={e => setDietForm(p => ({ ...p, id: e.target.value.toUpperCase().replace(/\s/g,'') }))} className={`w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500 font-mono ${editingDietId ? 'opacity-60' : ''}`} /></div>
                    <div><label className="text-[11px] font-bold text-slate-600 block mb-1">الاسم *</label><input placeholder="حلال" value={dietForm.label||''} onChange={e => setDietForm(p => ({ ...p, label: e.target.value }))} className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-amber-200">
                    <button type="button" onClick={() => setDietForm(p => ({ ...p, iconType: 'emoji', icon: '' }))} className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${(dietForm.iconType||'emoji')==='emoji' ? 'bg-amber-100 text-amber-800' : 'text-slate-500'}`}>😀 إيموجي</button>
                    <button type="button" onClick={() => setDietForm(p => ({ ...p, iconType: 'image', icon: '' }))} className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${dietForm.iconType==='image' ? 'bg-amber-100 text-amber-800' : 'text-slate-500'}`}>🖼️ صورة</button>
                  </div>
                  {(dietForm.iconType||'emoji')==='emoji' ? (
                    <div className="flex flex-wrap gap-1.5">{ICON_EMOJIS.map(e => (<button key={e} type="button" onClick={() => setDietForm(p => ({ ...p, icon: e, iconType: 'emoji' }))} className={`text-lg p-1 rounded-lg border transition cursor-pointer ${dietForm.icon===e ? 'bg-amber-200 border-amber-400' : 'bg-white border-slate-200'}`}>{e}</button>))}</div>
                  ) : (
                    <div><input placeholder="رابط الصورة" value={dietForm.iconType==='image'?(dietForm.icon||''):''} onChange={e => setDietForm(p => ({ ...p, icon: e.target.value, iconType: 'image' }))} className="w-full p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />{dietForm.icon && dietForm.iconType==='image' && <div className="mt-2 flex items-center gap-2"><img src={convertUrl(dietForm.icon)} alt="" className="w-6 h-6 object-contain rounded" crossOrigin="anonymous" referrerPolicy="no-referrer" /><span className="text-[10px] text-slate-400">معاينة</span></div>}</div>
                  )}
                  <div className="flex flex-wrap gap-1.5">{COLOR_PRESETS.map(c => (<button key={c} type="button" onClick={() => setDietForm(p => ({ ...p, color: c }))} className={`text-[10px] px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition ${c} ${dietForm.color===c ? 'ring-2 ring-amber-500 ring-offset-1' : ''}`}>معاينة</button>))}</div>
                  <div className="flex gap-2"><button onClick={handleSaveDiet} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition flex items-center justify-center gap-2"><Save className="w-3.5 h-3.5" /> حفظ</button><button onClick={resetDietForm} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm cursor-pointer transition hover:bg-slate-50">إلغاء</button></div>
                </div>
              )}
              <div className="grid gap-2">{dietaryFilters.map(d => (
                <div key={d.id} className={`flex items-center justify-between p-3.5 bg-white border rounded-2xl transition ${d.enabled ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
                  <div className="flex items-center gap-3"><span className={`text-xs px-3 py-1.5 rounded-full border font-bold inline-flex items-center gap-1 ${d.color}`}>{d.iconType==='image'&&d.icon ? <img src={convertUrl(d.icon)} alt="" className="w-3.5 h-3.5 object-contain rounded-sm" crossOrigin="anonymous" referrerPolicy="no-referrer" /> : d.icon} {d.label}</span></div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => ctx.updateSettings({ dietaryFilters: dietaryFilters.map(x => x.id===d.id ? { ...x, enabled: !x.enabled } : x) })} className={`p-2 rounded-lg transition cursor-pointer ${d.enabled ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}>{d.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                    <button onClick={() => startEditDiet(d)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm(`حذف "${d.label}"؟`)) ctx.updateSettings({ dietaryFilters: dietaryFilters.filter(x => x.id!==d.id) }); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}</div>
            </div>
          )}

          {/* ═══ MARKETING TAB ═══ */}
          {tab === 'marketing' && (
            <div className="space-y-5 animate-slideUp max-w-2xl mx-auto">

              {/* ── Flash Deals ── */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-md"><Zap className="w-5 h-5" /></div>
                    <div><h3 className="text-sm font-black text-slate-800">عروض لفترة محدودة</h3><p className="text-[11px] text-slate-500">عروض بعد تنازلي تحفّز الشراء الفوري</p></div>
                  </div>
                  <button onClick={() => { const fd = ctx.settings.flashDeals || { enabled: false, items: [] }; ctx.updateSettings({ flashDeals: { ...fd, enabled: !fd.enabled } }); }}
                    className={`w-14 h-7 rounded-full relative transition-all duration-300 cursor-pointer ${ctx.settings.flashDeals?.enabled ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${ctx.settings.flashDeals?.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {ctx.settings.flashDeals?.enabled && (
                  <div className="space-y-2">
                    <button onClick={() => { const fd = ctx.settings.flashDeals; const items = [...(fd.items || []), { itemId: '', oldPrice: 0, newPrice: 0, endsAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16) }]; ctx.updateSettings({ flashDeals: { ...fd, items } }); }}
                      className="text-[10px] font-bold px-3 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer transition hover:bg-red-600">
                      <Plus className="w-3 h-3 inline" /> إضافة عرض
                    </button>
                    {(ctx.settings.flashDeals.items || []).map((deal, i) => (
                      <div key={i} className="bg-white border border-red-100 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-600">عرض #{i + 1}</span>
                          <button onClick={() => { const items = ctx.settings.flashDeals.items.filter((_, j) => j !== i); ctx.updateSettings({ flashDeals: { ...ctx.settings.flashDeals, items } }); }}
                            className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <select value={deal.itemId} onChange={e => {
                          const items = [...ctx.settings.flashDeals.items];
                          const selected = ctx.menuItems.find(m => m.id === e.target.value);
                          items[i] = { ...items[i], itemId: e.target.value, oldPrice: selected?.price || items[i].oldPrice };
                          ctx.updateSettings({ flashDeals: { ...ctx.settings.flashDeals, items } });
                        }} className="w-full p-2 border border-red-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-amber-500 cursor-pointer">
                          <option value="">اختر المنتج</option>
                          {ctx.menuItems.map(m => <option key={m.id} value={m.id}>{m.name} — {m.price} ر.س</option>)}
                        </select>
                        <div className="grid grid-cols-3 gap-2">
                          <div><label className="text-[9px] font-bold text-slate-500">السعر القديم</label><input type="number" value={deal.oldPrice || ''} onChange={e => { const items = [...ctx.settings.flashDeals.items]; items[i] = { ...items[i], oldPrice: parseFloat(e.target.value) || 0 }; ctx.updateSettings({ flashDeals: { ...ctx.settings.flashDeals, items } }); }}
                            className="w-full p-1.5 border border-red-200 rounded-lg text-xs bg-slate-50" /></div>
                          <div><label className="text-[9px] font-bold text-slate-500">السعر الجديد</label><input type="number" value={deal.newPrice || ''} onChange={e => { const items = [...ctx.settings.flashDeals.items]; items[i] = { ...items[i], newPrice: parseFloat(e.target.value) || 0 }; ctx.updateSettings({ flashDeals: { ...ctx.settings.flashDeals, items } }); }}
                            className="w-full p-1.5 border border-red-200 rounded-lg text-xs bg-slate-50" /></div>
                          <div><label className="text-[9px] font-bold text-slate-500">ينتهي في</label><input type="datetime-local" value={deal.endsAt?.slice(0, 16) || ''} onChange={e => { const items = [...ctx.settings.flashDeals.items]; items[i] = { ...items[i], endsAt: new Date(e.target.value).toISOString() }; ctx.updateSettings({ flashDeals: { ...ctx.settings.flashDeals, items } }); }}
                            className="w-full p-1.5 border border-red-200 rounded-lg text-[10px] bg-slate-50" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Recommendations ── */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><Star className="w-5 h-5" /></div>
                    <div><h3 className="text-sm font-black text-slate-800">التوصيات الذكية</h3><p className="text-[11px] text-slate-500">يقترح منتجات تناسب سلة العميل تلقائياً</p></div>
                  </div>
                  <button onClick={() => { const r = ctx.settings.recommendations || { enabled: false, title: '' }; ctx.updateSettings({ recommendations: { ...r, enabled: !r.enabled } }); }}
                    className={`w-14 h-7 rounded-full relative transition-all duration-300 cursor-pointer ${ctx.settings.recommendations?.enabled ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${ctx.settings.recommendations?.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                {ctx.settings.recommendations?.enabled && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">عنوان القسم:</label>
                    <input value={ctx.settings.recommendations.title || ''} onChange={e => ctx.updateSettings({ recommendations: { ...ctx.settings.recommendations, title: e.target.value } })}
                      placeholder="قد يعجبك أيضاً" className="w-full p-2.5 border border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ DISCOUNTS TAB ═══ */}
          {tab === 'discounts' && (
            <div className="space-y-5 animate-slideUp max-w-2xl mx-auto">
              <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md"><Gift className="w-5 h-5" /></div><div><h3 className="text-sm font-black text-slate-800">خصم الكمية</h3></div></div>
                <button onClick={() => ctx.updateSettings({ discountEnabled: !ctx.settings.discountEnabled })} className={`w-14 h-7 rounded-full relative transition-all duration-300 cursor-pointer ${ctx.settings.discountEnabled ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${ctx.settings.discountEnabled ? 'right-1' : 'left-1'}`} /></button>
              </div>
              <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-700">المستويات ({sortedTiers.length})</h3><button onClick={() => { resetTierForm(); setTierForm({ visible: true }); setShowTierForm(true); }} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer transition"><Plus className="w-3.5 h-3.5" /> إضافة</button></div>
              {showTierForm && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-scaleIn">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="الاسم" value={tierForm.label||''} onChange={e => setTierForm(p => ({ ...p, label: e.target.value }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                    <input type="number" min={1} max={100} placeholder="نسبة الخصم %" value={tierForm.discountPercent||''} onChange={e => setTierForm(p => ({ ...p, discountPercent: parseFloat(e.target.value)||0 }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  </div>
                  {/* Discount type selector */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1.5">نوع الحد الأدنى:</label>
                    <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-amber-200">
                      <button type="button" onClick={() => setTierForm(p => ({ ...p, discountType: 'items' }))}
                        className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${(tierForm.discountType || 'items') === 'items' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                        عدد القطع
                      </button>
                      <button type="button" onClick={() => setTierForm(p => ({ ...p, discountType: 'value' }))}
                        className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${tierForm.discountType === 'value' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                        قيمة الفاتورة (ر.س)
                      </button>
                    </div>
                  </div>
                  {(tierForm.discountType || 'items') === 'items' ? (
                    <input type="number" min={1} placeholder="الحد الأدنى (عدد القطع)" value={tierForm.minItems||''} onChange={e => setTierForm(p => ({ ...p, minItems: parseInt(e.target.value)||0 }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  ) : (
                    <input type="number" min={1} placeholder="الحد الأدنى (ر.س)" value={tierForm.minValue||''} onChange={e => setTierForm(p => ({ ...p, minValue: parseFloat(e.target.value)||0 }))} className="p-2.5 border border-amber-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={tierForm.visible!==false} onChange={e => setTierForm(p => ({ ...p, visible: e.target.checked }))} className="w-4 h-4 accent-amber-500" /><span className="text-xs font-bold text-slate-700"><Eye className="w-3.5 h-3.5 inline" /> إظهار للعميل</span></label>
                  <div className="flex gap-2"><button onClick={handleSaveTier} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm cursor-pointer transition"><Save className="w-3.5 h-3.5 inline mr-1" /> حفظ</button><button onClick={resetTierForm} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm cursor-pointer transition">إلغاء</button></div>
                </div>
              )}
              <div className="grid gap-2">{sortedTiers.map((t,i) => (
                <div key={t.id} className={`flex items-center justify-between p-3.5 bg-white border rounded-2xl transition ${t.visible ? 'border-slate-100' : 'border-dashed border-slate-300 opacity-70'}`}>
                  <div className="flex items-center gap-3"><span className="text-xl">{TE[i]||'🏆'}</span><div><h4 className="text-sm font-black text-slate-800">{t.label} <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">{t.discountPercent}%</span>{!t.visible && <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold ml-1"><EyeOff className="w-2.5 h-2.5 inline" /> مخفي</span>}</h4><p className="text-[11px] text-slate-400">{t.discountType === 'value' ? `≥ ${t.minValue || 0} ر.س` : `≥ ${t.minItems} قطعة`}</p></div></div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => ctx.updateSettings({ discountTiers: (ctx.settings.discountTiers||[]).map(x => x.id===t.id ? { ...x, visible: !x.visible } : x) })} className={`p-2 rounded-lg transition cursor-pointer ${t.visible ? 'text-blue-500' : 'text-slate-400'}`}>{t.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => startEditTier(t)} className="p-2 text-slate-400 hover:text-amber-600 rounded-lg cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm(`حذف "${t.label}"؟`)) ctx.updateSettings({ discountTiers: (ctx.settings.discountTiers||[]).filter(x => x.id!==t.id) }); }} className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function convertUrl(url: string): string {
  if (!url) return '';
  const m1 = url.match(/drive\.google\.com\/file\/d\/([^/]+)/); if (m1) return `https://lh3.googleusercontent.com/d/${m1[1]}`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/); if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/); if (m3) return `https://lh3.googleusercontent.com/d/${m3[1]}`;
  return url;
}
