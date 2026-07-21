import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: storeSettings, error: fetchError } = await supabase.from('settings').select('*').eq('id', 'store').single();
  if (fetchError) { console.error("Fetch Error:", fetchError); return; }

  const next = { ...storeSettings, flash_deals: { enabled: true, items: [{ itemId: 'item-1', oldPrice: 10, newPrice: 5, endsAt: new Date().toISOString() }] } };

  const { error } = await supabase.from('settings').upsert({
    id: 'store',
    logo_url: next.logo_url,
    whatsapp_number: next.whatsapp_number,
    discount_tiers: next.discount_tiers,
    discount_enabled: next.discount_enabled,
    dietary_filters: next.dietary_filters,
    texts: next.texts,
    sales_rep: next.sales_rep,
    hero_bg_url: next.hero_bg_url,
    hero_bg_enabled: next.hero_bg_enabled,
    content_bg_url: next.content_bg_url,
    content_bg_enabled: next.content_bg_enabled,
    footer_bg_url: next.footer_bg_url,
    footer_bg_enabled: next.footer_bg_enabled,
    footer_logo_url: next.footer_logo_url,
    header_brand_img_url: next.header_brand_img_url,
    brand_text: next.brand_text,
    brand_text_color: next.brand_text_color,
    brand_img_size: next.brand_img_size,
    brand_font: next.brand_font,
    flash_deals: next.flash_deals,
    recommendations: next.recommendations,
    featured: next.featured
  });

  if (error) {
    console.error("Upsert Error:", error);
  } else {
    console.log("Upsert Success!");
  }
}
run();
