-- =================================================================
-- LEVEL UP DEEN – Seed Avatar Shop Items
-- =================================================================

-- 1. Insert starter items (Headwear, Outfit, Accessory, Background, Title)
insert into public.items (id, name, item_type, rarity, price_coin, unlock_level, gender_restriction, description)
values
  -- Headwear (Male)
  (gen_random_uuid(), 'Peci Hitam', 'headwear', 'common', 50, 1, 'male', 'Peci hitam standar untuk menemani ibadah.'),
  (gen_random_uuid(), 'Peci Putih Haji', 'headwear', 'rare', 150, 3, 'male', 'Peci putih dengan corak rapi, nyaman dipakai.'),
  (gen_random_uuid(), 'Sorban Hijau', 'headwear', 'epic', 500, 7, 'male', 'Sorban elegan berwarna hijau zamrud.'),

  -- Headwear (Female)
  (gen_random_uuid(), 'Hijab Instan Hitam', 'headwear', 'common', 50, 1, 'female', 'Hijab instan yang praktis dan nyaman untuk sehari-hari.'),
  (gen_random_uuid(), 'Pashmina Nude', 'headwear', 'rare', 150, 3, 'female', 'Pashmina elegan dengan warna lembut.'),
  (gen_random_uuid(), 'Khimar Syari', 'headwear', 'epic', 500, 7, 'female', 'Khimar panjang yang anggun dan syari.'),

  -- Outfit (Male)
  (gen_random_uuid(), 'Baju Koko Polos', 'outfit', 'common', 100, 1, 'male', 'Baju koko berlengan pendek yang nyaman untuk harian.'),
  (gen_random_uuid(), 'Koko Kurta', 'outfit', 'rare', 250, 4, 'male', 'Baju koko bergaya kurta panjang modern.'),
  (gen_random_uuid(), 'Jubah Arab', 'outfit', 'epic', 600, 8, 'male', 'Jubah panjang ala Timur Tengah.'),

  -- Outfit (Female)
  (gen_random_uuid(), 'Gamis Basic', 'outfit', 'common', 100, 1, 'female', 'Gamis potongan A-line yang nyaman.'),
  (gen_random_uuid(), 'Abaya Hitam', 'outfit', 'rare', 250, 4, 'female', 'Abaya hitam khas Timur Tengah yang elegan.'),
  (gen_random_uuid(), 'Gamis Pesta', 'outfit', 'epic', 600, 8, 'female', 'Gamis dengan hiasan cantik untuk acara penting.'),

  -- Accessories (Unisex mostly)
  (gen_random_uuid(), 'Tasbih Kayu', 'accessory', 'common', 80, 2, 'unisex', 'Tasbih kayu klasik 33 butir.'),
  (gen_random_uuid(), 'Al-Quran Saku', 'accessory', 'rare', 200, 5, 'unisex', 'Al-Quran kecil yang selalu dibawa kemana-mana.'),
  (gen_random_uuid(), 'Sajadah Turki', 'accessory', 'epic', 450, 10, 'unisex', 'Sajadah tebal dengan motif indah asli Turki.'),
  (gen_random_uuid(), 'Sarung Wadimor', 'accessory', 'rare', 180, 4, 'male', 'Sarung tenun asli Indonesia.'),

  -- Backgrounds (Unisex)
  (gen_random_uuid(), 'Sajadah Masjid', 'background', 'common', 200, 3, 'unisex', 'Suasana dalam masjid yang tenang.'),
  (gen_random_uuid(), 'Taman Madinah', 'background', 'rare', 400, 6, 'unisex', 'Pemandangan taman di dekat Masjid Nabawi.'),
  (gen_random_uuid(), 'Pemandangan Ka''bah', 'background', 'epic', 800, 12, 'unisex', 'Pemandangan kiblat suci umat Islam.'),
  (gen_random_uuid(), 'Langit Malam Cosmic', 'background', 'legendary', 1500, 20, 'unisex', 'Malam Lailatul Qadar dengan taburan bintang.'),

  -- Titles (Unisex)
  (gen_random_uuid(), 'Santri Baru', 'title', 'common', 50, 1, 'unisex', 'Gelar untuk penuntut ilmu pemula.'),
  (gen_random_uuid(), 'Pejuang Subuh', 'title', 'rare', 300, 5, 'unisex', 'Diberikan bagi yang konsisten sholat Subuh berjamaah.'),
  (gen_random_uuid(), 'Al-Hafizh', 'title', 'legendary', 2000, 25, 'unisex', 'Gelar mulia sang penghafal Al-Quran.')
on conflict do nothing;
