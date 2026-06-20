import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log("Seeding items...");
  
  const items = [
    { name: 'Peci Hitam', item_type: 'headwear', rarity: 'common', price_coin: 50, unlock_level: 1, gender_restriction: 'male', description: 'Peci hitam standar untuk menemani ibadah.' },
    { name: 'Peci Putih Haji', item_type: 'headwear', rarity: 'rare', price_coin: 150, unlock_level: 3, gender_restriction: 'male', description: 'Peci putih dengan corak rapi, nyaman dipakai.' },
    { name: 'Sorban Hijau', item_type: 'headwear', rarity: 'epic', price_coin: 500, unlock_level: 7, gender_restriction: 'male', description: 'Sorban elegan berwarna hijau zamrud.' },
    { name: 'Hijab Instan Hitam', item_type: 'headwear', rarity: 'common', price_coin: 50, unlock_level: 1, gender_restriction: 'female', description: 'Hijab instan yang praktis dan nyaman untuk sehari-hari.' },
    { name: 'Pashmina Nude', item_type: 'headwear', rarity: 'rare', price_coin: 150, unlock_level: 3, gender_restriction: 'female', description: 'Pashmina elegan dengan warna lembut.' },
    { name: 'Khimar Syari', item_type: 'headwear', rarity: 'epic', price_coin: 500, unlock_level: 7, gender_restriction: 'female', description: 'Khimar panjang yang anggun dan syari.' },
    { name: 'Baju Koko Polos', item_type: 'outfit', rarity: 'common', price_coin: 100, unlock_level: 1, gender_restriction: 'male', description: 'Baju koko berlengan pendek yang nyaman untuk harian.' },
    { name: 'Koko Kurta', item_type: 'outfit', rarity: 'rare', price_coin: 250, unlock_level: 4, gender_restriction: 'male', description: 'Baju koko bergaya kurta panjang modern.' },
    { name: 'Jubah Arab', item_type: 'outfit', rarity: 'epic', price_coin: 600, unlock_level: 8, gender_restriction: 'male', description: 'Jubah panjang ala Timur Tengah.' },
    { name: 'Gamis Basic', item_type: 'outfit', rarity: 'common', price_coin: 100, unlock_level: 1, gender_restriction: 'female', description: 'Gamis potongan A-line yang nyaman.' },
    { name: 'Abaya Hitam', item_type: 'outfit', rarity: 'rare', price_coin: 250, unlock_level: 4, gender_restriction: 'female', description: 'Abaya hitam khas Timur Tengah yang elegan.' },
    { name: 'Gamis Pesta', item_type: 'outfit', rarity: 'epic', price_coin: 600, unlock_level: 8, gender_restriction: 'female', description: 'Gamis dengan hiasan cantik untuk acara penting.' },
    { name: 'Tasbih Kayu', item_type: 'accessory', rarity: 'common', price_coin: 80, unlock_level: 2, gender_restriction: 'unisex', description: 'Tasbih kayu klasik 33 butir.' },
    { name: 'Al-Quran Saku', item_type: 'accessory', rarity: 'rare', price_coin: 200, unlock_level: 5, gender_restriction: 'unisex', description: 'Al-Quran kecil yang selalu dibawa kemana-mana.' },
    { name: 'Sajadah Turki', item_type: 'accessory', rarity: 'epic', price_coin: 450, unlock_level: 10, gender_restriction: 'unisex', description: 'Sajadah tebal dengan motif indah asli Turki.' },
    { name: 'Sarung Wadimor', item_type: 'accessory', rarity: 'rare', price_coin: 180, unlock_level: 4, gender_restriction: 'male', description: 'Sarung tenun asli Indonesia.' },
    { name: 'Sajadah Masjid', item_type: 'background', rarity: 'common', price_coin: 200, unlock_level: 3, gender_restriction: 'unisex', description: 'Suasana dalam masjid yang tenang.' },
    { name: 'Taman Madinah', item_type: 'background', rarity: 'rare', price_coin: 400, unlock_level: 6, gender_restriction: 'unisex', description: 'Pemandangan taman di dekat Masjid Nabawi.' },
    { name: 'Pemandangan Ka\'bah', item_type: 'background', rarity: 'epic', price_coin: 800, unlock_level: 12, gender_restriction: 'unisex', description: 'Pemandangan kiblat suci umat Islam.' },
    { name: 'Langit Malam Cosmic', item_type: 'background', rarity: 'legendary', price_coin: 1500, unlock_level: 20, gender_restriction: 'unisex', description: 'Malam Lailatul Qadar dengan taburan bintang.' },
    { name: 'Santri Baru', item_type: 'title', rarity: 'common', price_coin: 50, unlock_level: 1, gender_restriction: 'unisex', description: 'Gelar untuk penuntut ilmu pemula.' },
    { name: 'Pejuang Subuh', item_type: 'title', rarity: 'rare', price_coin: 300, unlock_level: 5, gender_restriction: 'unisex', description: 'Diberikan bagi yang konsisten sholat Subuh berjamaah.' },
    { name: 'Al-Hafizh', item_type: 'title', rarity: 'legendary', price_coin: 2000, unlock_level: 25, gender_restriction: 'unisex', description: 'Gelar mulia sang penghafal Al-Quran.' }
  ];

  for (const item of items) {
    // Upsert by name to avoid duplicates
    const { error } = await supabase.from('items').upsert(item, { onConflict: 'name' });
    if (error) {
      console.error("Error inserting", item.name, error);
    } else {
      console.log("Inserted", item.name);
    }
  }
  
  console.log("Done seeding items.");
}

main();
