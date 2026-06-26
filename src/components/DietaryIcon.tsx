import { DietaryFilter } from '../data/menuData';

function convertUrl(url: string): string {
  if (!url) return '';
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);
  if (m3) return `https://lh3.googleusercontent.com/d/${m3[1]}`;
  return url;
}

/** Renders either emoji text or a resized image icon */
export function DietaryIcon({ filter, size = 14 }: { filter: DietaryFilter; size?: number }) {
  if (filter.iconType === 'image' && filter.icon) {
    const src = convertUrl(filter.icon);
    return (
      <img
        src={src}
        alt={filter.label}
        width={size}
        height={size}
        className="object-contain rounded-sm shrink-0 inline-block"
        style={{ width: size, height: size, verticalAlign: 'middle' }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return <span style={{ fontSize: size - 2, lineHeight: 1 }}>{filter.icon || '🏷️'}</span>;
}

/** Badge with icon + label */
export function DietaryBadge({ filter, small }: { filter: DietaryFilter; small?: boolean }) {
  const sz = small ? 12 : 14;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-bold ${filter.color} ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1.5'}`}>
      <DietaryIcon filter={filter} size={sz} />
      {filter.label}
    </span>
  );
}
