import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBrandingInDb() {
  console.log('Fetching settings from Supabase...');
  const { data, error } = await supabase.from('settings').select('*').eq('id', 'store').single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }
  
  if (!data) {
    console.log('No settings found in DB.');
    return;
  }
  
  let needsUpdate = false;
  const updatePayload = {};

  if (data.brand_text === 'PerfectChef' || data.brand_text === 'perfectchef' || data.brand_text === 'Rawbilla Store') {
    updatePayload.brand_text = 'RAWBILLA STORE';
    needsUpdate = true;
  }

  // Also clear default logo if it's there
  if (data.header_brand_img_url === 'https://drive.google.com/file/d/1vz13kD11gFg38ik-U2Be7S0_0pvy7-ww/view?usp=drive_link' || 
      data.header_brand_img_url === 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200') {
    updatePayload.header_brand_img_url = '';
    needsUpdate = true;
  }

  if (data.logo_url === 'https://drive.google.com/file/d/1vz13kD11gFg38ik-U2Be7S0_0pvy7-ww/view?usp=drive_link' ||
      data.logo_url === 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200') {
    updatePayload.logo_url = '';
    needsUpdate = true;
  }

  if (data.texts) {
    let textsUpdated = false;
    const newTexts = { ...data.texts };
    
    if (newTexts.footerBrandName === 'PerfectChef' || newTexts.footerBrandName === 'Rawbilla Store') {
      newTexts.footerBrandName = 'RAWBILLA STORE';
      textsUpdated = true;
    }
    
    if (textsUpdated) {
      updatePayload.texts = newTexts;
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    console.log('Updating settings in DB:', updatePayload);
    const { error: updateErr } = await supabase.from('settings').update(updatePayload).eq('id', 'store');
    if (updateErr) {
      console.error('Error updating settings:', updateErr);
    } else {
      console.log('Successfully updated DB branding to RAWBILLA STORE and cleared default old logos.');
    }
  } else {
    console.log('DB already clean, no update needed.');
  }
}

fixBrandingInDb();
