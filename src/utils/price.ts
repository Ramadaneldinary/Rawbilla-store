import type { OptionItem } from '../data/menuData';

/**
 * Calculate the effective unit price for a cart item.
 * If options have prices → use ONLY options total (replaces base price)
 * If no options or all options are free → use base price
 */
export function calcUnitPrice(basePrice: number, selectedOptions: OptionItem[]): number {
  const optsTotal = selectedOptions.reduce((s, o) => s + o.price, 0);
  // If customer selected options with price → that IS the price (not added to base)
  if (optsTotal > 0) return optsTotal;
  // No priced options → use base price
  return basePrice;
}
