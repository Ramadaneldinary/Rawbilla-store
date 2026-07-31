import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: items } = await supabase.from('menu_items').select('id, name').limit(1);
  if (!items || items.length === 0) return console.log("No items");
  const id = items[0].id;
  console.log("Updating item:", id);
  const { data, error } = await supabase.from('menu_items').update({ hidden: false }).eq('id', id).select();
  console.log("Update Error:", error);
  console.log("Update Data:", data);
}
run();
