import type { MenuItem } from '../data/menuData';

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
export function getShareUrl(item: MenuItem, siteUrl: string, whatsappNumber: string): string {
  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
  
  let msg = `*${item.name}*`;
  if (item.nameEn) msg += ` — ${item.nameEn}`;
  msg += `\n\n`;
  if (item.description) msg += `${item.description.slice(0, 100)}...\n\n`;
  msg += `السعر: *${item.price} ر.س*`;
  if (item.unit) msg += ` / ${item.unit}`;
  msg += `\n\n`;
  
  // Create a deep link by attaching the product parameter
  let productShareUrl = siteUrl;
  try {
    const urlObj = new URL(siteUrl);
    urlObj.searchParams.set('product', item.id);
    productShareUrl = urlObj.toString();
  } catch (e) {
    const separator = siteUrl.includes('?') ? '&' : '?';
    productShareUrl = `${siteUrl}${separator}product=${item.id}`;
  }
  if (item.images && item.images.length > 0) {
    // If the image is an absolute URL (like supabase storage or google drive), include it.
    if (item.images[0].startsWith('http')) {
      msg += `🖼️ صورة المنتج:\n${item.images[0]}\n\n`;
    }
  }

  msg += `شاهد المنتج واطلب الآن:\n${productShareUrl}\n\n`;
  if (cleanNumber) {
    msg += `أو تواصل مباشرة: wa.me/${cleanNumber}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

