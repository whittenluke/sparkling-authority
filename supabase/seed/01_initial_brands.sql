-- Seed data for initial brands
-- This file should be run after schema.sql

INSERT INTO public.brands (name, description, website, country_of_origin, founded_year) VALUES
    ('Spindrift', 'Real fruit juice in sparkling water', 'https://drinkspindrift.com', 'United States', 2010),
    ('Polar', 'New England''s favorite sparkling water', 'https://www.polarseltzer.com', 'United States', 1882),
    ('Topo Chico', 'Mexican mineral water with natural carbonation', 'https://www.topochicousa.com', 'Mexico', 1895),
    ('LaCroix', 'Naturally essenced sparkling water', 'https://www.lacroixwater.com', 'United States', 1981),
    ('Perrier', 'French sparkling mineral water', 'https://www.perrier.com', 'France', 1863),
    ('San Pellegrino', 'Italian sparkling mineral water', 'https://www.sanpellegrino.com', 'Italy', 1899),
    ('Bubly', 'Sparkling water with natural flavors', 'https://www.bubly.com', 'United States', 2018),
    ('Liquid Death', 'Mountain water in a tallboy can', 'https://liquiddeath.com', 'United States', 2019),
    ('Trader Joe''s', 'Private label sparkling water', 'https://www.traderjoes.com', 'United States', 1958),
    ('Waterloo', 'Sparkling water with bold flavors', 'https://waterloosparkling.com', 'United States', 2017),
    ('Aha', 'Coca-Cola''s sparkling water brand', 'https://www.ahasparklingwater.com', 'United States', 2020),
    ('365', 'Whole Foods Market brand', 'https://www.wholefoodsmarket.com', 'United States', 1980),
    ('Good & Gather', 'Target''s private label brand', 'https://www.target.com', 'United States', 2019),
    ('Nixie', 'Sparkling water with natural flavors', 'https://www.nixiewater.com', 'United States', 2019),
    ('Sanzo', 'Asian-inspired sparkling water', 'https://www.drinksanzo.com', 'United States', 2019),
    ('Aura Bora', 'Herb and fruit sparkling water', 'https://aurabora.com', 'United States', 2019),
    ('Hal''s', 'New York''s original seltzer', 'https://www.halsnewyorkseltzer.com', 'United States', 1904),
    ('Poland Spring', 'Nestlé''s sparkling water brand', 'https://www.polandspring.com', 'United States', 1845),
    ('Recess', 'CBD-infused sparkling water', 'https://www.takearecess.com', 'United States', 2018),
    ('Canada Dry', 'Ginger ale and sparkling water', 'https://www.canadadry.com', 'Canada', 1904); 