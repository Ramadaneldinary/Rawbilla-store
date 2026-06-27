import React from 'react';
import { useApp } from '../store/AppContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const ctx = useApp();
  const settings = ctx?.settings;

  const sizeConfig = {
    sm: { img: 'w-7 h-7', title: 'text-sm', container: 'gap-1.5' },
    md: { img: 'w-10 h-10', title: 'text-xl', container: 'gap-2' },
    lg: { img: 'w-14 h-14', title: 'text-2xl', container: 'gap-3' }
  };

  const cfg = sizeConfig[size];
  const resolvedLogo = settings?.logoUrl || '/images/logo.png';
  const brandName = settings?.brandText || 'RAWBILLA STORE';

  return (
    <div className={`flex items-center ${cfg.container} select-none`}>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative bg-white p-1 rounded-xl border border-amber-100 shadow-sm">
          <img
            src={resolvedLogo}
            alt={brandName}
            className={`${cfg.img} object-contain rounded-lg`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/logo.png';
            }}
          />
        </div>
      </div>
      <span 
        style={{ fontFamily: "'Tajawal', 'Inter', sans-serif", fontWeight: 900, color: '#4a2c11' }} 
        className={`${cfg.title} tracking-tight bg-gradient-to-r from-[#4a2c11] to-[#6d4420] bg-clip-text text-transparent`}
      >
        {brandName}
      </span>
    </div>
  );
};

// دالة تحويل روابط جوجل درايف المضافة تلقائياً لتوافق استيراد الصور
export const convertDriveUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const id = url.split('/file/d/')[1]?.split('/')[0];
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  if (url.includes('id=')) {
    const id = url.split('id=')[1]?.split('&')[0];
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url;
};

// مكون شعار الفوتر المضاف تلقائياً
export const FooterLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  return <Logo size={size} />;
};
