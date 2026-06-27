import { useState, useRef, useEffect } from 'react';
import { Phone, X, MessageCircle, Palette } from 'lucide-react';

interface Props {
  phone: string;
  label?: string;
  size?: 'sm' | 'md';
  texts?: { title?: string; whatsapp?: string; whatsappHint?: string; call?: string; callHint?: string };
  showDesignRequest?: boolean;
  designPhone?: string;
}

export function ContactButton({ phone, label = 'تواصل معنا', size = 'md', texts, showDesignRequest, designPhone }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number, bottom?: number, left: number, transform: string }>({ left: 0, transform: '' });
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const telPhone = cleanPhone.startsWith('966') ? `+${cleanPhone}` : cleanPhone;
  const isSm = size === 'sm';

  const designMsg = encodeURIComponent(`السلام عليكم\n\nأرغب في تصميم متجر إلكتروني (منيو واتساب ذكي) لنشاطي التجاري.\n\nأرجو التواصل معي لمعرفة التفاصيل والأسعار.\n\nشكراً لكم`);
  const dPhone = (designPhone || cleanPhone).replace(/[^0-9+]/g, '');
  const telDPhone = dPhone.startsWith('966') ? `+${dPhone}` : dPhone;

  useEffect(() => {
    if (open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const menuH = showDesignRequest ? 230 : 170;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let newPos: any = { transform: 'none' };
      const menuW = 288; // w-72 is 288px
      if (isSm) {
        newPos.left = rect.right - menuW;
      } else {
        newPos.left = rect.left + rect.width / 2 - (menuW / 2);
      }
      
      // Screen bounds check
      if (newPos.left < 10) newPos.left = 10;
      if (newPos.left + menuW > window.innerWidth - 10) {
        newPos.left = window.innerWidth - menuW - 10;
      }

      if (spaceBelow >= menuH + 10) {
        newPos.top = rect.bottom + 8;
      } else if (spaceAbove >= menuH + 10) {
        newPos.bottom = window.innerHeight - rect.top + 8;
      } else {
        newPos.top = rect.bottom + 8; // fallback
      }
      setPos(newPos);
    }
  }, [open, showDesignRequest, isSm]);

  return (
    <div className="relative" ref={wrapRef}>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 font-bold rounded-full transition-all cursor-pointer shadow-lg active:scale-95 ${
          isSm
            ? 'px-3 py-1.5 text-[11px] bg-white/20 hover:bg-white/30 text-white border border-white/20'
            : 'px-5 py-2.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl'
        }`}>
        <MessageCircle className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
        {label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            className="fixed z-[101] animate-scaleIn w-72"
            style={{ 
              top: pos.top, 
              bottom: pos.bottom, 
              left: pos.left, 
              transform: pos.transform,
              transformOrigin: pos.bottom ? 'bottom center' : 'top center'
            }}>
            
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
              <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between">
                <span className="text-[11px] font-black text-white">{texts?.title || 'كيف تحب نتواصل؟'}</span>
                <button onClick={() => setOpen(false)} className="p-1 text-white/60 hover:text-white cursor-pointer rounded-full hover:bg-white/20 transition"><X className="w-3.5 h-3.5" /></button>
              </div>

              {/* WhatsApp */}
              <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-green-50 transition cursor-pointer group">
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white shadow group-hover:scale-110 transition-transform shrink-0">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">{texts?.whatsapp || 'واتساب'}</p>
                  <p className="text-[9px] text-green-600">{texts?.whatsappHint || 'إرسال رسالة فورية'}</p>
                </div>
              </a>

              {/* Call */}
              <a href={`tel:${telPhone}`} onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-blue-50 transition cursor-pointer border-t border-slate-100 group">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white shadow group-hover:scale-110 transition-transform shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">{texts?.call || 'اتصال مباشر'}</p>
                  <p className="text-[9px] text-blue-600">{texts?.callHint || 'اتصل الآن'}</p>
                </div>
              </a>

              {/* Design */}
              {showDesignRequest && (
                <a href={`https://wa.me/${dPhone}?text=${designMsg}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-purple-50 transition cursor-pointer border-t border-slate-100 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow group-hover:scale-110 transition-transform shrink-0">
                    <Palette className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">طلب تصميم متجر</p>
                    <p className="text-[9px] text-purple-600">احصل على متجرك الذكي</p>
                  </div>
                </a>
              )}

              {/* Footer */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100">
                <p className="text-[8px] text-slate-400 font-medium text-center">مود منيو — منيو واتساب ذكي</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
