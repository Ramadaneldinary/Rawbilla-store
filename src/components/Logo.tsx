import { useState } from 'react';
import { useApp } from '../store/AppContext';

function convertDriveUrl(url: string): string {
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

/* ═══════════════════════════════════════
   HEADER LOGO — Animated & Premium
   ═══════════════════════════════════════ */
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { settings } = useApp();
  const resolvedLogo = convertDriveUrl(settings.logoUrl);
  const brandImg = convertDriveUrl(settings.headerBrandImgUrl || '');
  const [imgError, setImgError] = useState(false);
  const [brandImgError, setBrandImgError] = useState(false);
  const hasLogo = resolvedLogo && !imgError;
  const hasBrandImg = brandImg && !brandImgError;

  const cfg = {
    sm: { img: 36, title: 16, chef: 16, sub: 7, gap: 8 },
    md: { img: 48, title: 20, chef: 20, sub: 8.5, gap: 10 },
    lg: { img: 60, title: 28, chef: 28, sub: 11, gap: 12 },
  }[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: cfg.gap, direction: 'ltr' }} className="select-none shrink-0 group/logo">
      {/* Logo Image with pulse glow */}
      {hasLogo && (
        <div className="relative">
          {/* Glow ring */}
          <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, #f59e0b40, #ea580c40, #f59e0b40)', filter: 'blur(6px)' }} />
          <img
            src={resolvedLogo}
            alt="RAWBILLA"
            className="relative hover:scale-105 transition-transform duration-500"
            style={{ width: cfg.img, height: cfg.img, objectFit: 'contain', flexShrink: 0, borderRadius: 14 }}
            crossOrigin="anonymous" referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* Brand image OR text */}
      {hasBrandImg ? (
        <img src={brandImg} alt="" style={{ height: settings.brandImgSize || cfg.img, maxWidth: 200, objectFit: 'contain' }}
          crossOrigin="anonymous" referrerPolicy="no-referrer" onError={() => setBrandImgError(true)} />
      ) : settings.brandText ? (
        <span style={{ fontFamily: settings.brandFont ? `'${settings.brandFont}','Tajawal','Inter',sans-serif` : "'Tajawal','Inter',sans-serif", fontWeight: 900, fontSize: cfg.title + 2, color: settings.brandTextColor || '#5c3a1e', letterSpacing: '0.02em' }}>
          {settings.brandText}
        </span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className="logo-text-shimmer" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: cfg.title, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <div className="logo-line-animate" style={{ flex: 1, height: 1.5, borderRadius: 2 }} />
            <span className="logo-sub-fade" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: cfg.sub, color: '#92400e', whiteSpace: 'nowrap' as const }}>
              
            </span>
            <div className="logo-line-animate" style={{ flex: 1, height: 1.5, borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   FOOTER LOGO
   ═══════════════════════════════════════ */
export function FooterLogo() {
  const { settings } = useApp();
  const resolvedLogo = convertDriveUrl(settings.logoUrl);
  const [imgError, setImgError] = useState(false);
  const hasLogo = resolvedLogo && !imgError;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, direction: 'ltr' }} className="select-none">
      {hasLogo && (
        <img src={resolvedLogo} alt=""
          style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0, borderRadius: 14 }}
          crossOrigin="anonymous" referrerPolicy="no-referrer" onError={() => setImgError(true)} />
      )}
      {settings.brandText ? (
        <span style={{ fontFamily: settings.brandFont ? `'${settings.brandFont}','Tajawal',sans-serif` : "'Tajawal',sans-serif", fontWeight: 900, fontSize: 18, color: settings.brandTextColor || '#5c3a1e' }}>{settings.brandText}</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5c3a1e' }}>RAWBILLA</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 9, color: '#92400e', marginTop: 2 }}>
            
          </span>
        </div>
      )}
    </div>
  );
}

export { convertDriveUrl };
