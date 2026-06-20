-- =================================================================
-- LEVEL UP DEEN – Avatar 3D & Item Shop Enhancements
-- =================================================================

-- 1. Extend items table with 3D model support and gender restriction
alter table public.items
  add column if not exists model_url text,
  add column if not exists gender_restriction varchar(10) not null default 'unisex';

-- Add check constraint for gender_restriction values
alter table public.items
  add constraint items_gender_restriction_check
  check (gender_restriction in ('male', 'female', 'unisex'));

-- 2. Trigger: enforce max 1 equipped item per item_type per user
create or replace function public.enforce_single_equip()
returns trigger
language plpgsql
as $$
declare
  v_item_type varchar(20);
begin
  if new.is_equipped = true then
    -- Lookup the item_type of the item being equipped
    select item_type into v_item_type
    from public.items
    where id = new.item_id;

    -- Un-equip any other item of the same type for this user
    update public.user_inventory
    set is_equipped = false
    where user_id = new.user_id
      and is_equipped = true
      and id != new.id
      and item_id in (
        select id from public.items where item_type = v_item_type
      );
  end if;

  return new;
end;
$$;

create trigger trg_enforce_single_equip
before insert or update of is_equipped on public.user_inventory
for each row execute procedure public.enforce_single_equip();

-- 3. Seed: Starter Items (Ikhwan / Male)
insert into public.items (name, item_type, rarity, price_coin, unlock_level, description, gender_restriction) values
  ('Peci Hitam Polos',       'headwear',    'common',    100,  1, 'Peci hitam klasik untuk sehari-hari.',           'male'),
  ('Peci Rajut Putih',       'headwear',    'common',    120,  1, 'Peci rajut putih khas pesantren.',               'male'),
  ('Kopiah Motif Batik',     'headwear',    'rare',      250,  5, 'Kopiah dengan motif batik elegan.',              'male'),
  ('Sorban Kepala',          'headwear',    'epic',      500, 10, 'Sorban kepala ala ulama klasik.',                 'male'),
  ('Baju Koko Pendek',       'outfit',      'common',    150,  1, 'Baju koko lengan pendek, nyaman dan rapi.',      'male'),
  ('Baju Koko Panjang',      'outfit',      'common',    180,  1, 'Baju koko lengan panjang untuk acara resmi.',    'male'),
  ('Kurta Pakistan',         'outfit',      'rare',      300,  5, 'Kurta gaya Pakistan yang stylish.',              'male'),
  ('Jubah Pria',             'outfit',      'epic',      600, 10, 'Jubah pria dengan detail bordir premium.',       'male'),
  ('Celana Sirwal',          'bottom',      'common',    120,  1, 'Celana sirwal di atas mata kaki.',               'male'),
  ('Sarung Batik',           'bottom',      'rare',      200,  3, 'Sarung batik motif tradisional.',                'male'),
  ('Celana Bahan Formal',    'bottom',      'common',    140,  1, 'Celana bahan formal warna gelap.',               'male'),
  ('Surban Leher',           'accessory',   'common',    80,   1, 'Surban yang dipakai di leher/pundak.',           'male'),
  ('Tasbih Tangan',          'accessory',   'rare',      200,  3, 'Tasbih kayu yang dipakai di pergelangan.',       'male'),
  ('Jam Tangan Klasik',      'accessory',   'epic',      450,  8, 'Jam tangan klasik dengan desain minimalis.',     'male');

-- 4. Seed: Starter Items (Akhwat / Female)
insert into public.items (name, item_type, rarity, price_coin, unlock_level, description, gender_restriction) values
  ('Khimar Instan Polos',    'headwear',    'common',    100,  1, 'Khimar instan warna polos, praktis.',            'female'),
  ('Pashmina Satin',         'headwear',    'common',    130,  1, 'Pashmina satin lembut dan elegan.',              'female'),
  ('Jilbab Segi Empat',      'headwear',    'rare',      220,  3, 'Jilbab segi empat motif bunga.',                 'female'),
  ('Bergo Sport',            'headwear',    'rare',      250,  5, 'Bergo sport untuk aktivitas harian.',            'female'),
  ('Abaya Hitam',            'outfit',      'common',    200,  1, 'Abaya hitam simpel dan syar i.',                 'female'),
  ('Gamis Pastel',           'outfit',      'rare',      350,  5, 'Gamis warna pastel dengan detail renda.',        'female'),
  ('Tunik Panjang',          'outfit',      'common',    180,  1, 'Tunik panjang dengan potongan A-line.',          'female'),
  ('Gamis Bordir Premium',   'outfit',      'epic',      650, 10, 'Gamis premium dengan bordir tangan.',            'female'),
  ('Cadar Niqab',            'accessory',   'rare',      200,  3, 'Cadar/niqab bahan chiffon.',                    'female'),
  ('Tas Tote Kanvas',        'accessory',   'common',    150,  1, 'Tas tote kanvas motif islami.',                  'female'),
  ('Bros Bunga Mutiara',     'accessory',   'epic',      400,  8, 'Bros bunga dengan hiasan mutiara.',              'female');

-- 5. Seed: Universal Items (Unisex)
insert into public.items (name, item_type, rarity, price_coin, unlock_level, description, gender_restriction) values
  ('Sajadah Masjid',             'background', 'common',    80,   1, 'Latar sajadah masjid yang tenang.',              'unisex'),
  ('Pemandangan Ka''bah',        'background', 'epic',      800, 15, 'Latar Ka''bah di waktu senja.',                  'unisex'),
  ('Langit Malam Cosmic',        'background', 'legendary', 1200, 20, 'Latar langit malam penuh bintang.',             'unisex'),
  ('Taman Madinah',              'background', 'rare',      400,  8, 'Latar taman hijau di kota Madinah.',             'unisex'),
  ('Gelar: Fajr Warrior',        'title',      'rare',      300,  5, 'Gelar bagi pejuang shalat Subuh.',              'unisex'),
  ('Gelar: Tahajjud Master',     'title',      'epic',      700, 12, 'Gelar bagi yang konsisten tahajjud.',            'unisex'),
  ('Gelar: Hafizh Starter',      'title',      'legendary', 1500, 25, 'Gelar bagi yang memulai menghafal Al-Quran.',  'unisex'),
  ('Gelar: Philanthropist',      'title',      'epic',      600, 10, 'Gelar bagi yang rajin bersedekah.',              'unisex');
