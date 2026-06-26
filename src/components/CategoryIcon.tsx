import { Category } from '../data/menuData';

function convertUrl(url: string): string {
  if (!url) return '';
  const m1 = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m1) return `https://lh3.googleusercontent.com/d/${m1[1]}`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (m3) return `https://lh3.googleusercontent.com/d/${m3[1]}`;
  const m4 = url.match(/drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/);
  if (m4) return `https://lh3.googleusercontent.com/d/${m4[1]}`;
  return url;
}

function looksLikeUrl(v: string): boolean {
  return /^https?:\/\//i.test(v.trim()) || /drive\.google\.com/i.test(v.trim());
}

/** Renders category icon — emoji or resized image (auto-detects URLs) */
export function CategoryIcon({ cat, size = 20 }: { cat: Category; size?: number }) {
  const isImage = cat.emojiType === 'image' || looksLikeUrl(cat.emoji || '');
  if (isImage && cat.emoji) {
    return (
      <img
        src={convertUrl(cat.emoji)}
        alt={cat.name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, borderRadius: size > 16 ? 6 : 3 }}
        className="inline-block"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={e => { (e.target as HTMLImageElement).replaceWith(document.createTextNode('🍴')); }}
      />
    );
  }
  return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>{cat.emoji || '🍴'}</span>;
}

/** Returns plain text for select options (no image in <option>) */
export function getCategoryLabel(cat: Category): string {
  if (cat.emojiType === 'image' || looksLikeUrl(cat.emoji || '')) return `📁 ${cat.name}`;
  return `${cat.emoji || '🍴'} ${cat.name}`;
}
