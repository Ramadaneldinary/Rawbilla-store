import { useState } from 'react';
import { MenuItem, OptionItem } from '../data/menuData';
import { X, Check } from 'lucide-react';
import { calcUnitPrice } from '../utils/price';

function cvt(url: string): string {
  if (!url) return '';
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  const m2 = url.match(/drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  return url;
}

interface CustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (selectedOptions: OptionItem[]) => void;
}

export function CustomizationModal({ item, onClose, onConfirm }: CustomizationModalProps) {
  const [selected, setSelected] = useState<Record<string, OptionItem[]>>(() => {
    const initial: Record<string, OptionItem[]> = {};
    item.optionGroups?.forEach(group => {
      if (group.minSelection === 1 && group.options.length > 0) {
        initial[group.id] = [group.options[0]];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const handleToggle = (groupId: string, option: OptionItem) => {
    const group = item.optionGroups?.find(g => g.id === groupId);
    if (!group) return;
    setSelected(prev => {
      const curr = prev[groupId] || [];
      const isSelected = curr.some(o => o.id === option.id);
      if (isSelected) {
        if (group.minSelection === 1 && curr.length === 1) return prev;
        return { ...prev, [groupId]: curr.filter(o => o.id !== option.id) };
      } else {
        if (group.maxSelection === 1) return { ...prev, [groupId]: [option] };
        if (curr.length < group.maxSelection) return { ...prev, [groupId]: [...curr, option] };
        return prev;
      }
    });
  };

  const isValid = item.optionGroups?.every(g => {
    const len = selected[g.id]?.length || 0;
    return len >= g.minSelection && len <= g.maxSelection;
  }) ?? true;

  const handleConfirm = () => {
    if (isValid) onConfirm(Object.values(selected).flat());
  };


  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col border border-slate-100 animate-scaleIn">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {item.images?.[0] && <img src={cvt(item.images[0])} alt="" className="w-8 h-8 object-cover rounded-lg" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">تخصيص: {item.name}</h2>
              <p className="text-xs text-slate-500 font-medium">السعر الأساسي: {item.price.toFixed(2)} ر.س</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
          {item.optionGroups?.map(group => {
            const curr = selected[group.id] || [];
            return (
              <div key={group.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{group.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {group.minSelection === 1 && group.maxSelection === 1
                        ? <span className="text-amber-600 font-bold">مطلوب (اختر 1)</span>
                        : group.maxSelection > 1
                          ? <span>اختياري (حتى {group.maxSelection})</span>
                          : <span>اختياري</span>
                      }
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
                    {curr.length} / {group.maxSelection}
                  </span>
                </div>
                <div className="grid gap-2">
                  {group.options.map(opt => {
                    const isSel = curr.some(o => o.id === opt.id);
                    return (
                      <button key={opt.id} onClick={() => handleToggle(group.id, opt)}
                        className={`flex justify-between items-center p-3 border rounded-2xl text-right transition cursor-pointer ${isSel ? 'bg-amber-50 border-amber-400 font-bold' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSel ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                            {isSel && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{opt.name}</span>
                        </div>
                        {opt.price > 0 && <span className="text-sm font-bold text-amber-600 shrink-0">+{opt.price.toFixed(2)} ر.س</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-2xl transition cursor-pointer text-sm">
            إلغاء
          </button>
          <button onClick={handleConfirm} disabled={!isValid}
            className={`flex-1 py-3 text-white font-bold rounded-2xl transition cursor-pointer text-sm ${isValid ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 shadow-md active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed opacity-75'}`}>
            أضف — {calcUnitPrice(item.price, Object.values(selected).flat()).toFixed(2)} ر.س
          </button>
        </div>
      </div>
    </div>
  );
}
