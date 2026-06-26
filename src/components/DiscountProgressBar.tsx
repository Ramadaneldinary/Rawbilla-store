import { useApp, DEFAULT_TEXTS } from '../store/AppContext';
import { Gift, TrendingUp } from 'lucide-react';
import { calcUnitPrice } from '../utils/price';

function getTierStyle(i: number) {
  const s = [
    { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-700', emoji: '🥉' },
    { bg: 'from-slate-300 to-slate-400', text: 'text-slate-600', emoji: '🥈' },
    { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-700', emoji: '🥇' },
    { bg: 'from-purple-400 to-indigo-500', text: 'text-purple-700', emoji: '💎' },
  ];
  return s[i % s.length];
}

export function DiscountProgressBar() {
  const { settings, discountResult, cart } = useApp();
  const T = settings.texts || DEFAULT_TEXTS;

  if (!settings.discountEnabled || !settings.discountTiers?.length) return null;

  const { totalItems, discountPercent, discountAmount } = discountResult;

  // Sort and filter visible tiers
  const allTiers = [...settings.discountTiers].sort((a, b) => {
    const aV = a.discountType === 'value' ? (a.minValue || 0) : a.minItems;
    const bV = b.discountType === 'value' ? (b.minValue || 0) : b.minItems;
    return aV - bV;
  });
  const visibleTiers = allTiers.filter(t => t.visible !== false);
  if (visibleTiers.length === 0) return null;

  const firstTier = visibleTiers[0];
  const isValueBased = firstTier.discountType === 'value';

  // Subtotal
  const subtotal = cart.reduce((t, ci) => t + calcUnitPrice(ci.menuItem.price, ci.selectedOptions) * ci.quantity, 0);
  const currentValue = isValueBased ? subtotal : totalItems;

  // Helper
  const getMin = (tier: typeof firstTier) => isValueBased ? (tier.minValue || 0) : tier.minItems;
  const lastTier = visibleTiers[visibleTiers.length - 1];
  const maxMin = getMin(lastTier) || 1;

  // Find current visible tier (actually reached)
  let activeVisibleTier: typeof firstTier | null = null;
  let activeIdx = -1;
  for (let i = visibleTiers.length - 1; i >= 0; i--) {
    if (currentValue >= getMin(visibleTiers[i])) {
      activeVisibleTier = visibleTiers[i];
      activeIdx = i;
      break;
    }
  }

  // Next visible tier (the one to aim for)
  const nextVisibleTier = activeIdx < visibleTiers.length - 1 ? visibleTiers[activeIdx + 1] : null;

  // Is actually getting a discount right now?
  const hasActiveDiscount = discountPercent > 0 && discountAmount > 0;
  const reachedMax = activeVisibleTier && !nextVisibleTier && hasActiveDiscount;

  // Progress
  const overallProgress = currentValue <= 0 ? 0 : currentValue >= maxMin ? 100 : (currentValue / maxMin) * 100;

  // Remaining to next
  const nextMin = nextVisibleTier ? getMin(nextVisibleTier) : 0;
  const remaining = isValueBased ? Math.max(0, nextMin - subtotal) : Math.max(0, nextMin - totalItems);
  const nextProgress = nextVisibleTier ? Math.min(100, ((currentValue - (activeVisibleTier ? getMin(activeVisibleTier) : 0)) / (nextMin - (activeVisibleTier ? getMin(activeVisibleTier) : 0))) * 100) : 0;

  const headerLabel = isValueBased ? 'خصم حسب قيمة الطلب' : 'خصم حسب عدد القطع';

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-3.5 select-none animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm"><Gift className="w-3.5 h-3.5" /></div>
          <span className="text-[11px] font-black text-slate-700">{headerLabel}</span>
        </div>
        {hasActiveDiscount && (
          <span className="text-[10px] font-black px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-sm">
            خصم {discountPercent}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative mb-2">
        <div className="h-3.5 bg-slate-200/70 rounded-full overflow-hidden relative shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${Math.min(100, overallProgress)}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 2s infinite linear', backgroundSize: '200% 100%' }} />
          </div>
        </div>
        {/* Tier markers */}
        <div className="absolute top-0 left-0 right-0 h-3.5 flex items-center pointer-events-none">
          {visibleTiers.map((tier, idx) => {
            const pos = (getMin(tier) / maxMin) * 100;
            const reached = currentValue >= getMin(tier);
            const style = getTierStyle(idx);
            return (
              <div key={tier.id} className="absolute" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black shadow-sm transition-all duration-500 ${
                  reached ? `bg-gradient-to-br ${style.bg} border-white text-white scale-110` : 'bg-white border-slate-300 text-slate-400'
                }`}>{reached ? '✓' : idx + 1}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Labels */}
      <div className="relative h-7 mb-1">
        {visibleTiers.map((tier, idx) => {
          const pos = (getMin(tier) / maxMin) * 100;
          const reached = currentValue >= getMin(tier);
          const style = getTierStyle(idx);
          return (
            <div key={tier.id} className="absolute flex flex-col items-center" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
              <span className={`text-[8px] font-black whitespace-nowrap leading-none ${reached ? style.text : 'text-slate-400'}`}>
                {isValueBased ? `${getMin(tier)} ر.س` : `${getMin(tier)} قطعة`}
              </span>
              <span className={`text-[8px] font-bold whitespace-nowrap leading-none mt-0.5 ${reached ? 'text-green-600' : 'text-slate-400'}`}>
                {tier.discountPercent}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl p-2.5 border border-amber-100/60 mt-1">
        {currentValue === 0 || !cart.length ? (
          /* Empty — motivate to start */
          <div className="flex items-center gap-2 text-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[10px] text-slate-500 font-bold" dir="rtl">
              {isValueBased
                ? <>اطلب بقيمة <span className="text-amber-600 font-black">{getMin(firstTier)} ر.س</span> واحصل على خصم <span className="text-green-600 font-black">{firstTier.discountPercent}%</span></>
                : (T.discountHint || 'أضف {qty} قطع للحصول على خصم {pct}%').replace('{qty}', String(firstTier.minItems || 5)).replace('{pct}', String(firstTier.discountPercent || 5))
              }
            </p>
          </div>

        ) : reachedMax ? (
          /* Reached highest tier */
          <div className="flex items-center gap-2 justify-center">
            <span className="text-base">{getTierStyle(activeIdx).emoji}</span>
            <div className="text-center">
              <p className="text-[10px] font-black text-purple-700" dir="rtl">{T.discountReachedMsg || 'مبروك! وصلت لأعلى مستوى'} ({activeVisibleTier?.label})</p>
              <p className="text-[10px] font-bold text-green-600" dir="rtl">خصم {discountPercent}% — {T.discountSavedMsg || 'وفّرت'} {discountAmount.toFixed(2)} ر.س</p>
            </div>
          </div>

        ) : (
          /* In progress */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasActiveDiscount && activeVisibleTier && <span className="text-sm">{getTierStyle(activeIdx).emoji}</span>}
              <div>
                {hasActiveDiscount && activeVisibleTier ? (
                  <>
                    <p className="text-[10px] font-black text-slate-700">
                      المستوى: <span className={getTierStyle(activeIdx).text}>{activeVisibleTier.label}</span> ({discountPercent}%)
                    </p>
                    <p className="text-[10px] font-bold text-green-600">وفّرت {discountAmount.toFixed(2)} ر.س</p>
                  </>
                ) : (
                  <p className="text-[10px] font-bold text-slate-500" dir="rtl">
                    {isValueBased
                      ? <>أضف <span className="text-amber-600 font-black">{remaining.toFixed(0)} ر.س</span> للحصول على خصم <span className="text-green-600 font-black">{(nextVisibleTier || firstTier).discountPercent}%</span></>
                      : <>أضف <span className="text-amber-600 font-black">{remaining} قطعة</span> للحصول على خصم <span className="text-green-600 font-black">{(nextVisibleTier || firstTier).discountPercent}%</span></>
                    }
                  </p>
                )}
              </div>
            </div>
            {/* Next tier indicator — always show if exists */}
            {nextVisibleTier && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg px-2.5 py-1.5 border border-amber-200/50" dir="rtl">
                <p className="text-[9px] font-bold text-slate-500 leading-none">{T.discountNextLabel || 'القادم'}</p>
                <p className="text-[10px] font-black leading-tight mt-0.5">
                  <span className="text-amber-700">{isValueBased ? `${remaining.toFixed(0)} ر.س` : `${remaining} قطعة`}</span>
                  <span className="text-slate-400 mx-0.5">=</span>
                  <span className="text-green-600">{nextVisibleTier.discountPercent}%</span>
                </p>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, nextProgress))}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom counter */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="text-[10px] font-bold text-slate-400">{isValueBased ? 'قيمة الطلب:' : 'عدد القطع:'}</span>
        <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
          {isValueBased ? `${subtotal.toFixed(0)} ر.س` : totalItems}
        </span>
      </div>
    </div>
  );
}
