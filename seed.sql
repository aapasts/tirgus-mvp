-- Seed data for Categories
-- Root Categories
INSERT INTO public.categories (slug, name, icon) VALUES
('transport', 'Transports', 'Car'),
('real-estate', 'Nekustamie īpašumi', 'Home'),
('construction', 'Būvniecība', 'Hammer'),
('electronics', 'Elektrotehnika', 'Smartphone'),
('clothes', 'Apģērbi, apavi', 'Shirt'),
('home', 'Mājai', 'Armchair'),
('production', 'Ražošana', 'Factory'),
('children', 'Bērniem', 'Baby'),
('animals', 'Dzīvnieki', 'Dog'),
('agriculture', 'Lauksaimniecība', 'Tractor')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Transport
DO $$
DECLARE
    parent_id uuid;
BEGIN
    SELECT id INTO parent_id FROM public.categories WHERE slug = 'transport';
    
    INSERT INTO public.categories (slug, name, parent_id, icon) VALUES
    ('cars', 'Vieglie auto', parent_id, 'Car'),
    ('moto', 'Motocikli', parent_id, 'Bike'),
    ('bicycle', 'Velosipēdi', parent_id, 'Bike'),
    ('parts', 'Rezerves daļas', parent_id, 'Wrench')
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Subcategories for Real Estate
DO $$
DECLARE
    parent_id uuid;
BEGIN
    SELECT id INTO parent_id FROM public.categories WHERE slug = 'real-estate';
    
    INSERT INTO public.categories (slug, name, parent_id, icon) VALUES
    ('flats', 'Dzīvokļi', parent_id, 'Building'),
    ('houses', 'Mājas', parent_id, 'Home'),
    ('land', 'Zeme', parent_id, 'Map'),
    ('commercial', 'Telpas', parent_id, 'Briefcase')
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Create a test user profile if not exists (This part might fail if user doesn't exist in auth.users, 
-- so we usually rely on the user signing up. But for local dev we might want to insert a dummy profile 
-- if we can link it to a known auth user. For now, we will skip inserting listings that require a valid user_id 
-- unless we know the user_id. 
-- INSTEAD, we will just provide the categories as that is the main request.)

-- If you want to insert listings, you need a valid user_id.
-- You can run this after you have signed up in the app.
-- Replace 'YOUR_USER_ID_HERE' with your actual UUID from auth.users

/*
INSERT INTO public.listings (user_id, category_id, title, description, price, location, status)
SELECT 
    auth.uid(), -- This won't work directly in seed script without context, so we comment it out
    c.id,
    'BMW 320d 2015',
    'Lieliskā stāvoklī, tikko no Vācijas.',
    12500,
    'Rīga',
    'active'
FROM public.categories c WHERE c.slug = 'cars'
LIMIT 1;
*/
