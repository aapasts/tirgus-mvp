-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES (Hierarchical)
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  name text not null,
  parent_id uuid references public.categories(id),
  icon text, -- Lucide icon name
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LISTINGS
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  category_id uuid references public.categories(id) not null,
  title text not null,
  description text,
  price decimal(12, 2),
  currency text default 'EUR',
  location text,
  status text default 'active', -- active, sold, inactive
  views_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ATTRIBUTES (Dynamic fields like 'Mileage', 'Year')
create table public.attributes (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) not null,
  name text not null,
  slug text not null,
  type text not null, -- text, number, select, boolean
  options jsonb, -- for select type: ["Diesel", "Petrol"]
  required boolean default false
);

-- LISTING ATTRIBUTES (Values)
create table public.listing_attributes (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  attribute_id uuid references public.attributes(id) not null,
  value text,
  unique(listing_id, attribute_id)
);

-- LISTING IMAGES
create table public.listing_images (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  url text not null,
  is_main boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FAVORITES
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, listing_id)
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.attributes enable row level security;
alter table public.listing_attributes enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Categories policies
create policy "Categories are viewable by everyone."
  on public.categories for select
  using ( true );

-- Listings policies
create policy "Listings are viewable by everyone."
  on public.listings for select
  using ( true );

create policy "Users can insert their own listings."
  on public.listings for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own listings."
  on public.listings for update
  using ( auth.uid() = user_id );

create policy "Users can delete own listings."
  on public.listings for delete
  using ( auth.uid() = user_id );

-- Attributes policies
create policy "Attributes are viewable by everyone."
  on public.attributes for select
  using ( true );

-- Listing Attributes policies
create policy "Listing attributes are viewable by everyone."
  on public.listing_attributes for select
  using ( true );

create policy "Users can insert attributes for their own listings."
  on public.listing_attributes for insert
  with check ( exists ( select 1 from public.listings where id = listing_id and user_id = auth.uid() ) );

create policy "Users can update attributes for their own listings."
  on public.listing_attributes for update
  using ( exists ( select 1 from public.listings where id = listing_id and user_id = auth.uid() ) );

create policy "Users can delete attributes for their own listings."
  on public.listing_attributes for delete
  using ( exists ( select 1 from public.listings where id = listing_id and user_id = auth.uid() ) );

-- Listing Images policies
create policy "Listing images are viewable by everyone."
  on public.listing_images for select
  using ( true );

create policy "Users can insert images for their own listings."
  on public.listing_images for insert
  with check ( exists ( select 1 from public.listings where id = listing_id and user_id = auth.uid() ) );

create policy "Users can update images for their own listings."
  on public.listing_images for update
  using ( exists ( select 1 from public.listings where id = listing_id and user_id = auth.uid() ) );

create policy "Users can delete images for their own listings."
  on public.listing_images for delete
  using ( exists ( select 1 from public.listings where id = listing_id and user_id = auth.uid() ) );

-- Favorites policies
create policy "Users can view their own favorites."
  on public.favorites for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own favorites."
  on public.favorites for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own favorites."
  on public.favorites for delete
  using ( auth.uid() = user_id );

-- Functions for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_listings
  before update on public.listings
  for each row execute procedure public.handle_updated_at();
