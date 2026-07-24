import type { MenuItem } from '../data/menuData';
import type { StoreSettings } from '../store/AppContext';

/** Get order count for a product — stored in localStorage, starts from item.orderCount */
export function getOrderCount(itemId: string, baseCount: number = 0): number {
  const key = `pc_orders_${itemId}`;
  const stored = localStorage.getItem(key);
  if (stored) return parseInt(stored) || baseCount;
  // Initialize with base + small random variation
  const initial = baseCount + Math.floor(Math.random() * 5);
  localStorage.setItem(key, String(initial));
  return initial;
}

/** Increment order count when added to cart */
export function incrementOrderCount(itemId: string, baseCount: number = 0): number {
  const current = getOrderCount(itemId, baseCount);
  const newCount = current + 1;
  localStorage.setItem(`pc_orders_${itemId}`, String(newCount));
  return newCount;
}

/** Generate WhatsApp share message for a product */
export function getShareUrl(item: MenuItem, siteUrl: string, settings: StoreSettings): string {
  const cleanNumber = settings.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, '') : '';
  
  // Check if item is in an active flash deal
  let displayPrice = item.price;
  if (settings.flashDeals?.enabled && settings.flashDeals.items) {
    const activeDeal = settings.flashDeals.items.find(
      d => d.itemId === item.id && new Date(d.endsAt).getTime() > Date.now()
    );
    if (activeDeal) {
      displayPrice = activeDeal.newPrice;
    }
  }

  let msg = `*${item.name}*`;
  if (item.nameEn) msg += ` — ${item.nameEn}`;
  msg += `\n\n`;
  
  const desc = item.description || settings.texts?.defaultShareDesc || 'أجود أنواع الشوكولا والحلويات. اطلب الآن واستمتع بالمذاق الرائع.';
  msg += `${desc.slice(0, 150)}...\n\n`;
  
  msg += `السعر: *${displayPrice} ر.س*`;
  if (item.unit) msg += ` / ${item.unit}`;
  msg += `\n\n`;
  
  // Create a deep link by attaching the product parameter
  // Add a unique version parameter to force WhatsApp to fetch the new image/preview
  const cacheBuster = `v=${Math.floor(Date.now() / 1000000)}`;
  
  let productShareUrl = siteUrl;
  try {
    const urlObj = new URL(siteUrl);
    urlObj.searchParams.set('product', item.id);
    urlObj.searchParams.set('v', cacheBuster);
    productShareUrl = urlObj.toString();
  } catch (e) {
    const separator = siteUrl.includes('?') ? '&' : '?';
    productShareUrl = `${siteUrl}${separator}product=${item.id}&v=${cacheBuster}`;
  }
  msg += `شاهد المنتج واطلب الآن:\n${productShareUrl}\n\n`;
  if (cleanNumber) {
    msg += `أو تواصل مباشرة: wa.me/${cleanNumber}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

