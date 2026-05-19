-- BeachBrain AI — Database Migration
-- Voer dit uit in Supabase: SQL Editor → New query → plak alles → Run

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- LOCATIONS
-- ============================================================
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  city text not null,
  latitude float not null default 51.5,
  longitude float not null default 4.0,
  type text not null default 'beach_club' check (type in ('beach_club', 'terras', 'water')),
  distance_to_german_border_km int not null default 100,
  created_at timestamptz default now()
);

alter table locations enable row level security;
create policy "Users can manage own locations" on locations
  for all using (auth.uid() = user_id);

-- ============================================================
-- UPLOADS
-- ============================================================
create table if not exists uploads (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  file_name text not null,
  file_type text not null check (file_type in ('csv', 'excel', 'pdf')),
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'error')),
  parsed_rows int,
  date_range_start date,
  date_range_end date,
  created_at timestamptz default now()
);

alter table uploads enable row level security;
create policy "Users can manage own uploads" on uploads
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

-- ============================================================
-- DAILY SALES
-- ============================================================
create table if not exists daily_sales (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  total_revenue decimal(10,2) not null default 0,
  total_transactions int not null default 0,
  total_guests int not null default 0,
  avg_spend_per_guest decimal(8,2) not null default 0,
  food_revenue decimal(10,2) not null default 0,
  drinks_revenue decimal(10,2) not null default 0,
  cocktail_revenue decimal(10,2) not null default 0,
  terrace_occupancy_pct int not null default 0,
  staff_cost decimal(10,2) not null default 0,
  created_at timestamptz default now(),
  unique(location_id, date)
);

alter table daily_sales enable row level security;
create policy "Users can manage own daily_sales" on daily_sales
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

create index if not exists idx_daily_sales_location_date on daily_sales(location_id, date desc);

-- ============================================================
-- HOURLY SALES
-- ============================================================
create table if not exists hourly_sales (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  hour int not null check (hour >= 0 and hour <= 23),
  revenue decimal(10,2) not null default 0,
  transactions int not null default 0,
  unique(location_id, date, hour)
);

alter table hourly_sales enable row level security;
create policy "Users can manage own hourly_sales" on hourly_sales
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

create index if not exists idx_hourly_sales_location_date on hourly_sales(location_id, date desc);

-- ============================================================
-- PRODUCT SALES
-- ============================================================
create table if not exists product_sales (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  product_name text not null,
  category text not null default 'overig' check (
    category in ('cocktail','bier','wijn','spirits','frisdrank','food_snacks','food_main','food_dessert','overig')
  ),
  quantity int not null default 0,
  revenue decimal(10,2) not null default 0
);

alter table product_sales enable row level security;
create policy "Users can manage own product_sales" on product_sales
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

create index if not exists idx_product_sales_location_date on product_sales(location_id, date desc);
create index if not exists idx_product_sales_product on product_sales(location_id, product_name);

-- ============================================================
-- WEATHER CACHE
-- ============================================================
create table if not exists weather_cache (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  temp_max decimal(5,2) not null default 0,
  temp_min decimal(5,2) not null default 0,
  feels_like decimal(5,2) not null default 0,
  sun_hours decimal(4,1) not null default 0,
  rain_mm decimal(6,2) not null default 0,
  rain_probability int not null default 0,
  wind_speed_kmh decimal(5,1) not null default 0,
  wind_direction text not null default 'W' check (
    wind_direction in ('N','NE','E','SE','S','SW','W','NW')
  ),
  uv_index decimal(4,1) not null default 0,
  cloud_cover_pct int not null default 0,
  humidity_pct int not null default 0,
  sunset_time time not null default '21:00',
  is_forecast boolean not null default true,
  fetched_at timestamptz default now(),
  unique(location_id, date)
);

alter table weather_cache enable row level security;
create policy "Users can manage own weather_cache" on weather_cache
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

create index if not exists idx_weather_cache_location_date on weather_cache(location_id, date);

-- ============================================================
-- FORECASTS
-- ============================================================
create table if not exists forecasts (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  predicted_revenue decimal(10,2) not null default 0,
  predicted_guests int not null default 0,
  predicted_transactions int not null default 0,
  confidence_score int not null default 50 check (confidence_score >= 0 and confidence_score <= 100),
  terrace_weather_score int not null default 50,
  beach_vibe_score int not null default 50,
  german_visitor_probability int not null default 20,
  cocktail_weather_index int not null default 50,
  aperol_index int not null default 50,
  bbq_potential int not null default 50,
  sunset_traffic_score int not null default 50,
  outdoor_seating_potential int not null default 50,
  holiday_boost_factor decimal(5,3) not null default 1.0,
  german_tourism_factor decimal(5,3) not null default 1.0,
  recommended_staff int not null default 4,
  predicted_top_products jsonb not null default '[]',
  created_at timestamptz default now(),
  unique(location_id, date)
);

alter table forecasts enable row level security;
create policy "Users can manage own forecasts" on forecasts
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

create index if not exists idx_forecasts_location_date on forecasts(location_id, date);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
create table if not exists ai_insights (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  insight_text text not null,
  insight_type text not null check (
    insight_type in ('revenue','product','staff','weather','holiday')
  ),
  impact_pct int not null default 0,
  confidence int not null default 50,
  valid_from date not null,
  valid_until date not null,
  created_at timestamptz default now()
);

alter table ai_insights enable row level security;
create policy "Users can manage own ai_insights" on ai_insights
  for all using (
    location_id in (select id from locations where user_id = auth.uid())
  );

create index if not exists idx_ai_insights_location on ai_insights(location_id, valid_until desc);

-- ============================================================
-- STORAGE BUCKET voor uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('kassabestanden', 'kassabestanden', false)
on conflict (id) do nothing;

create policy "Users can upload own files" on storage.objects
  for insert with check (
    bucket_id = 'kassabestanden' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own files" on storage.objects
  for select using (
    bucket_id = 'kassabestanden' and auth.uid()::text = (storage.foldername(name))[1]
  );
