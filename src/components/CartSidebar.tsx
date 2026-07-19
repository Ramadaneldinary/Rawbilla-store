import { useState } from 'react';
import { useApp, DEFAULT_TEXTS } from '../store/AppContext';
import { calcUnitPrice } from '../utils/price';
import { saveCustomerOrder, findCustomer, getLastOrderItems } from '../utils/customers';
import { DiscountProgressBar } from './DiscountProgressBar';
import { Recommendations } from './Recommendations';
import { X, Plus, Minus, Trash2, Coffee, MessageSquare, ShoppingCart, Send, Truck } from 'lucide-react';

const DELIVERY_FEE = 15;

export function CartSidebar({ onClose }: { onClose: () => void }) {
  const ctx = useApp();
  const T = ctx.settings.texts || DEFAULT_TEXTS;
  const { cart, discountResult } = ctx;
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childName, setChildName] = useState('');
  const [childGender, setChildGender] = useState('');

  const dobParts = childDob.split('-');
  const dobYear = dobParts[0] || '';
  const dobMonth = dobParts[1] || '';
  const dobDay = dobParts[2] || '';

  const updateDob = (y: string, m: string, d: string) => {
    if (!y && !m && !d) setChildDob('');
    else setChildDob(`${y}-${m}-${d}`);
  };

  const FREE_DELIVERY_MIN = ctx.settings.freeDeliveryThreshold ?? 200;

  const subtotal = cart.reduce((t, ci) => {
    return t + calcUnitPrice(ci.menuItem.price, ci.selectedOptions) * ci.quantity;
  }, 0);
  const { discountPercent, discountAmount, cartonFreeCount, cartonDiscountAmount, cartonItemName } = discountResult;
  const afterDiscount = Math.max(0, subtotal - discountAmount - cartonDiscountAmount);
  const isFreeDelivery = afterDiscount >= FREE_DELIVERY_MIN;
  const deliveryFee = deliveryMethod === 'delivery' ? (isFreeDelivery ? 0 : DELIVERY_FEE) : 0;
  const remainingForFree = Math.max(0, FREE_DELIVERY_MIN - afterDiscount);
  const freeDeliveryProgress = Math.min(100, (afterDiscount / FREE_DELIVERY_MIN) * 100);
  const tax = afterDiscount * 0.15;
  const total = afterDiscount + tax + deliveryFee;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const [reorderMsg, setReorderMsg] = useState('');

  const handleSendWhatsApp = () => {
    if (!name.trim() || !phone.trim()) return;
    if (deliveryMethod === 'delivery' && !address.trim()) return;
    // Save customer data + order
    saveCustomerOrder(phone, name, address, cart, total, childDob, childName, childGender);
    ctx.sendWhatsAppOrder(deliveryMethod, name, phone, address, childDob, childName, childGender);
    ctx.clearCart();
    setShowCheckout(false);
    onClose();
  };

  // Auto-fill when phone changes
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setReorderMsg('');
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length >= 9) {
      const customer = findCustomer(clean);
      if (customer) {
        if (customer.name && !name) setName(customer.name);
        if (customer.address && !address) setAddress(customer.address);
        if (customer.childDob && !childDob) setChildDob(customer.childDob);
        if (customer.childName && !childName) setChildName(customer.childName);
        if (customer.childGender && !childGender) setChildGender(customer.childGender);
        setReorderMsg(`عميل سابق — ${customer.orders.length} طلب`);
      }
    }
  };

  const handleReorder = () => {
    const clean = phone.replace(/[^0-9]/g, '');
    const lastItems = getLastOrderItems(clean);
    if (!lastItems) return;
    // Add last order items to cart
    lastItems.forEach(oi => {
      const menuItem = ctx.menuItems.find(m => m.id === oi.id);
      if (menuItem && !menuItem.outOfStock) {
        for (let q = 0; q < oi.quantity; q++) ctx.addToCart(menuItem, []);
      }
    });
    setShowCheckout(false);
    setReorderMsg('');
  };

  /*
   * LAYOUT STRATEGY (bulletproof scroll):
   * - Root: position:absolute inset:0 (fills parent completely)
   * - Header: position:absolute top:0 (fixed 56px)
   * - Scroll area: position:absolute top:56px bottom:Xpx
   * - Footer: position:absolute bottom:0 (fixed height)
   * This guarantees scroll works with ANY number of items.
   */

  // ── Empty ──
  if (cart.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0 }} className="bg-slate-50 select-none flex flex-col">
        <Header count={0} onClose={onClose} label={T.cartTitle || 'سلة الطلب'} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300"><Coffee className="w-8 h-8" /></div>
          <p className="text-sm font-bold text-slate-700">{T.cartEmptyText || 'السلة فارغة'}</p>
          <p className="text-xs text-slate-400 max-w-[220px]">{T.cartEmptyHint || 'اكتشف قائمتنا وأضف أطباقك المفضلة'}</p>
          <div className="w-full mt-2"><DiscountProgressBar /></div>
        </div>
      </div>
    );
  }

  // ── Checkout ──
  if (showCheckout) {
    return (
      <div style={{ position: 'absolute', inset: 0 }} className="bg-slate-50 select-none flex flex-col">
        <Header count={itemCount} onClose={onClose} label={T.cartTitle || 'سلة الطلب'} />
        {/* Scrollable checkout form */}
        <div style={{ position: 'absolute', top: 56, bottom: 120, left: 0, right: 0, overflowY: 'auto' }} className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">{T.cartOrderInfo || 'معلومات الطلب'}</h3>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setDeliveryMethod('pickup')} className={`py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${deliveryMethod === 'pickup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>🎒 استلام</button>
            <button onClick={() => setDeliveryMethod('delivery')} className={`py-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${deliveryMethod === 'delivery' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>🚚 توصيل {isFreeDelivery ? '(مجاني!)' : `(${DELIVERY_FEE} ر.س)`}</button>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل *" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
          <div>
            <input value={phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="رقم الجوال *" type="tel" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />
            {reorderMsg && (
              <div className="mt-1.5 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-green-700">{reorderMsg}</span>
                <button onClick={handleReorder} className="text-[10px] font-black text-green-600 bg-green-100 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-green-200 transition">
                  إعادة آخر طلب
                </button>
              </div>
            )}
          </div>
          {ctx.settings.childDobField?.enabled !== false && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 space-y-2">
              <label className="text-[10px] text-indigo-700 font-bold block pr-1">{ctx.settings.childDobField?.label || '👶 بيانات أول فرحة (اختياري)'}</label>
              
              <div className="flex gap-2">
                <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="اسم الطفل" className="w-1/2 p-2.5 border border-indigo-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400 text-slate-700" />
                <select value={childGender} onChange={e => setChildGender(e.target.value)} className="w-1/2 p-2.5 border border-indigo-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer">
                  <option value="">النوع</option>
                  <option value="boy">ولد 👦</option>
                  <option value="girl">بنت 👧</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select value={dobDay} onChange={e => updateDob(dobYear, dobMonth, e.target.value)} className="w-1/3 p-2.5 border border-indigo-200 rounded-xl text-sm bg-indigo-50/30 focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer">
                  <option value="">اليوم</option>
                  {Array.from({length: 31}, (_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>)}
                </select>
                <select value={dobMonth} onChange={e => updateDob(dobYear, e.target.value, dobDay)} className="w-1/3 p-2.5 border border-indigo-200 rounded-xl text-sm bg-indigo-50/30 focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer">
                  <option value="">الشهر</option>
                  {Array.from({length: 12}, (_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>)}
                </select>
                <select value={dobYear} onChange={e => updateDob(e.target.value, dobMonth, dobDay)} className="w-1/3 p-2.5 border border-indigo-200 rounded-xl text-sm bg-indigo-50/30 focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer">
                  <option value="">السنة</option>
                  {Array.from({length: 30}, (_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={String(y)}>{y}</option>; })}
                </select>
              </div>
            </div>
          )}
          {deliveryMethod === 'delivery' && <input value={address} onChange={e => setAddress(e.target.value)} placeholder="عنوان التوصيل *" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500" />}
          <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1.5 text-xs font-medium text-slate-500">
            <div className="flex justify-between"><span>{T.cartSubtotal || 'المجموع'}</span><span className="font-bold text-slate-700">{subtotal.toFixed(2)} ر.س</span></div>
            {cartonDiscountAmount > 0 && <div className="flex justify-between text-purple-600 bg-purple-50 rounded-lg px-2 py-1 border border-purple-100"><span className="font-bold">🎁 العرض الخاص: {cartonItemName} (مجاني) × {cartonFreeCount}</span><span className="font-black">-{cartonDiscountAmount.toFixed(2)} ر.س</span></div>}
            {discountPercent > 0 && <div className="flex justify-between text-green-600"><span className="font-bold">🎁 خصم {discountPercent}%</span><span className="font-black">-{discountAmount.toFixed(2)} ر.س</span></div>}
            <div className="flex justify-between"><span>{T.cartTax || 'الضريبة (15%)'}</span><span className="font-bold text-slate-700">{tax.toFixed(2)} ر.س</span></div>
            {deliveryMethod === 'delivery' && <div className="flex justify-between"><span>التوصيل</span>{isFreeDelivery ? <span className="font-black text-green-600">مجاني</span> : <span className="font-bold text-slate-700">{DELIVERY_FEE} ر.س</span>}</div>}
            <div className="flex justify-between text-base font-black text-slate-800 pt-2 border-t border-slate-100"><span>{T.cartTotal || 'الإجمالي'}</span><span className="text-amber-600">{total.toFixed(2)} ر.س</span></div>
          </div>
        </div>
        {/* Fixed bottom buttons */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }} className="p-4 bg-white border-t border-slate-200 space-y-2">
          <button onClick={handleSendWhatsApp} disabled={!name.trim() || !phone.trim() || (deliveryMethod === 'delivery' && !address.trim())}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:brightness-105 active:scale-[0.98] text-white font-black rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" /> {T.cartSendBtn || 'إرسال الطلب عبر واتساب'}
          </button>
          <button onClick={() => setShowCheckout(false)} className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm cursor-pointer hover:bg-slate-50 transition">{T.cartBackBtn || 'رجوع'}</button>
        </div>
      </div>
    );
  }

  // ── Cart Items ──
  return (
    <div style={{ position: 'absolute', inset: 0 }} className="bg-slate-50 select-none">
      {/* Fixed Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 2 }}>
        <Header count={itemCount} onClose={onClose} label={T.cartTitle || 'سلة الطلب'} />
      </div>

      {/* ★★★ SCROLLABLE ITEMS — absolute positioning guarantees scroll ★★★ */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          bottom: 150,
          left: 0,
          right: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
        className="p-3 space-y-2"
      >
        <DiscountProgressBar />

        {/* Carton Special Offer Progress / Alert */}
        {ctx.settings.featured.cartonOfferEnabled && ctx.settings.featured.cartonItemId && ctx.settings.featured.cartonBuyQty && ctx.settings.featured.cartonBuyQty > 0 && (() => {
          const buyQty = ctx.settings.featured.cartonBuyQty;
          const freeQty = ctx.settings.featured.cartonFreeQty || 1;
          const targetItem = ctx.menuItems.find(m => m.id === ctx.settings.featured.cartonItemId);
          if (!targetItem) return null;
          
          const cartItem = cart.find(ci => ci.menuItem.id === targetItem.id);
          const currentQty = cartItem ? cartItem.quantity : 0;
          const remaining = Math.max(0, buyQty - (currentQty % buyQty));
          const earnedCount = Math.floor(currentQty / buyQty) * freeQty;
          
          if (currentQty === 0) {
            return (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-2xl p-3 flex flex-col gap-1.5">
                <p className="text-[10px] text-purple-800 font-extrabold font-ar">
                  🔥 عرض خاص: اشترِ {buyQty} كرتون من {targetItem.name} واحصل على {freeQty} كرتون مجاناً!
                </p>
              </div>
            );
          } else if (remaining > 0) {
            const progress = ((currentQty % buyQty) / buyQty) * 100;
            return (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-2xl p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-purple-800 font-ar">
                  <span>العرض الخاص: {targetItem.name}</span>
                  <span>باقي {remaining} كرتون للحصول على الهدية!</span>
                </div>
                <div className="h-1.5 bg-purple-200/40 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                {earnedCount > 0 && (
                  <p className="text-[9px] text-green-600 font-bold font-ar">
                    🎉 لقد حصلت بالفعل على {earnedCount} كرتون مجاناً!
                  </p>
                )}
              </div>
            );
          } else {
            return (
              <div className="bg-gradient-to-r from-green-50 to-purple-50 border border-green-200/50 rounded-2xl p-3 text-center">
                <p className="text-[10px] text-green-700 font-black font-ar">
                  🎉 مبروك! حصلت على {earnedCount} كرتون مجاناً من {targetItem.name}!
                </p>
              </div>
            );
          }
        })()}

        {/* Free Delivery */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-green-600" /><span className="text-[11px] font-black text-green-800">التوصيل المجاني</span></div>
            {isFreeDelivery ? <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">🎉 مُفعّل!</span> : <span className="text-[10px] font-bold text-green-700">باقي {remainingForFree.toFixed(0)} ر.س</span>}
          </div>
          <div className="h-2 bg-green-200/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${freeDeliveryProgress}%` }} /></div>
          <p className="text-[9px] text-green-600 font-medium mt-1.5">{isFreeDelivery ? '✅ مبروك! التوصيل مجاناً!' : `أضف ${remainingForFree.toFixed(0)} ر.س للتوصيل المجاني 🚚`}</p>
        </div>

        {/* Cart items */}
        {cart.map(ci => {
          const unitP = calcUnitPrice(ci.menuItem.price, ci.selectedOptions);
          const lineTotal = unitP * ci.quantity;
          return (
            <div key={ci.id} className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1.5 shadow-sm cart-item-enter">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight font-ar">{ci.menuItem.name}</h4>
                  {ci.menuItem.nameEn && <p className="text-[9px] font-en italic mt-0.5" style={{ color: '#e97a1f' }}>{ci.menuItem.nameEn}</p>}
                  {ci.selectedOptions.length > 0 && <div className="text-[10px] text-amber-700 mt-0.5 flex flex-wrap gap-0.5">{ci.selectedOptions.map(opt => <span key={opt.id} className="bg-amber-50 px-1 py-0.5 rounded border border-amber-200/50">+ {opt.name}</span>)}</div>}
                  {ci.notes && editingNoteId !== ci.id && (
                    <button onClick={() => { setEditingNoteId(ci.id); setCurrentNote(ci.notes); }}
                      className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-medium mt-1 flex items-center gap-0.5 cursor-pointer hover:bg-indigo-100 transition">
                      <MessageSquare className="w-2.5 h-2.5" /> {ci.notes}
                    </button>
                  )}
                </div>
                <span className="text-xs font-black text-amber-600 shrink-0">{lineTotal.toFixed(2)} ر.س</span>
              </div>
              {editingNoteId === ci.id ? (
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <textarea value={currentNote} onChange={e => setCurrentNote(e.target.value)} placeholder={T.notePlaceholder || 'مثال: حار جداً، بدون بصل...'} className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-500 h-12 resize-none" />
                  <div className="flex justify-end gap-1 mt-1.5">
                    <button onClick={() => setEditingNoteId(null)} className="px-2 py-1 text-[10px] text-slate-500 font-bold hover:bg-slate-100 rounded-lg cursor-pointer">إلغاء</button>
                    <button onClick={() => { ctx.updateCartNotes(ci.id, currentNote); setEditingNoteId(null); }} className="px-2 py-1 text-[10px] bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 cursor-pointer">حفظ</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-50">
                  <button onClick={() => { setEditingNoteId(ci.id); setCurrentNote(ci.notes || ''); }} className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 cursor-pointer"><MessageSquare className="w-3 h-3" /> {ci.notes ? 'تعديل' : (T.cartNoteBtn || 'ملاحظة')}</button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => ctx.updateCartQuantity(ci.id, -1)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-bold text-slate-800 w-5 text-center">{ci.quantity}</span>
                    <button onClick={() => ctx.updateCartQuantity(ci.id, 1)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => ctx.removeFromCart(ci.id)} className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-rose-100/50 rounded-lg ml-0.5 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* التوصيات الذكية */}
        <Recommendations onAdd={item => ctx.addToCart(item, [])} onView={() => {}} />
      </div>

      {/* ★★★ FIXED BOTTOM — always visible, never hidden ★★★ */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }} className="p-3 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="space-y-1 text-xs font-medium text-slate-500 mb-2">
          <div className="flex justify-between"><span>{T.cartSubtotal || 'المجموع'}</span><span className="font-bold text-slate-700">{subtotal.toFixed(2)} ر.س</span></div>
          {cartonDiscountAmount > 0 && <div className="flex justify-between text-purple-600 bg-purple-50 rounded-lg px-2 py-1 border border-purple-100"><span className="font-bold">🎁 العرض الخاص: {cartonItemName} (مجاني) × {cartonFreeCount}</span><span className="font-black">-{cartonDiscountAmount.toFixed(2)} ر.س</span></div>}
          {discountPercent > 0 && <div className="flex justify-between text-green-600 bg-green-50 rounded-lg px-2 py-1 border border-green-100"><span className="font-bold">🎁 خصم {discountPercent}%</span><span className="font-black">-{discountAmount.toFixed(2)} ر.س</span></div>}
          <div className="flex justify-between"><span>{T.cartTax || 'الضريبة (15%)'}</span><span className="font-bold text-slate-700">{tax.toFixed(2)} ر.س</span></div>
          <div className="flex justify-between text-sm font-black text-slate-800 pt-1.5 border-t border-slate-100 mt-1">
            <span>{T.cartTotal || 'الإجمالي'}</span>
            <span className="text-amber-600">{(afterDiscount + tax).toFixed(2)} ر.س</span>
          </div>
        </div>
        <button onClick={() => setShowCheckout(true)}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:brightness-105 active:scale-[0.98] text-white font-black rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm">
          <Send className="w-4 h-4" /> {T.cartCheckoutBtn || 'إتمام الطلب عبر واتساب'}
        </button>
      </div>
    </div>
  );
}

/* ── Header ── */
function Header({ count, onClose, label }: { count: number; onClose: () => void; label: string }) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white h-14">
      <div className="flex items-center gap-2">
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-amber-600" />
          {count > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{count}</span>}
        </div>
        <h2 className="text-base font-black text-slate-800">{label}</h2>
      </div>
      <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer lg:hidden"><X className="w-5 h-5" /></button>
    </div>
  );
}
