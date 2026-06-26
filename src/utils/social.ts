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
  let msg = `*${item.name}*`;
  if (item.nameEn) msg += ` — ${item.nameEn}`;
  msg += `\n\n`;
  if (item.description) msg += `${item.description.slice(0, 100)}...\n\n`;
  msg += `السعر: *${item.price} ر.س*`;
  if (item.unit) msg += ` / ${item.unit}`;
  msg += `\n\n`;
  msg += `اطلب الآن:\n${siteUrl}\n\n`;
  msg += `أو تواصل مباشرة: wa.me/${whatsappNumber}`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
