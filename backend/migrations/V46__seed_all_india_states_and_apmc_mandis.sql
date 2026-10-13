-- V46 Seed All-India States, Districts, APMC Mandis and Market Prices
-- Ensures pan-India coverage across Assam, Maharashtra, Punjab, Gujarat, UP, Rajasthan, etc.

-- 1. Insert Master States across India
INSERT INTO states (id, name, code, country_code, is_active, created_at, updated_at)
VALUES
  ('state-assam', 'Assam', 'AS', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-maharashtra', 'Maharashtra', 'MH', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-punjab', 'Punjab', 'PB', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-gujarat', 'Gujarat', 'GJ', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-rajasthan', 'Rajasthan', 'RJ', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-uttar-pradesh', 'Uttar Pradesh', 'UP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-west-bengal', 'West Bengal', 'WB', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-tamil-nadu', 'Tamil Nadu', 'TN', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-kerala', 'Kerala', 'KL', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-bihar', 'Bihar', 'BR', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-madhya-pradesh', 'Madhya Pradesh', 'MP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-haryana', 'Haryana', 'HR', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-andhra-pradesh', 'Andhra Pradesh', 'AP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-telangana', 'Telangana', 'TS', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-odisha', 'Odisha', 'OD', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-himachal-pradesh', 'Himachal Pradesh', 'HP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-delhi', 'Delhi', 'DL', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (country_code, name) DO NOTHING;

-- 2. Insert Key Districts
INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-kamrup', s.id, 'Kamrup', 'KAMR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Assam' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-darrang', s.id, 'Darrang', 'DARR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Assam' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-cachar', s.id, 'Cachar', 'CACH', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Assam' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-nashik', s.id, 'Nashik', 'NASH', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Maharashtra' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-thane', s.id, 'Thane', 'THAN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Maharashtra' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-pune', s.id, 'Pune', 'PUNE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Maharashtra' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-nagpur', s.id, 'Nagpur', 'NAGP', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Maharashtra' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-ludhiana', s.id, 'Ludhiana', 'LUDH', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Punjab' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-amritsar', s.id, 'Amritsar', 'AMRI', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Punjab' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-mehsana', s.id, 'Mehsana', 'MEHS', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Gujarat' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-rajkot', s.id, 'Rajkot', 'RAJK', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Gujarat' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-jaipur', s.id, 'Jaipur', 'JAIP', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Rajasthan' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-kota', s.id, 'Kota', 'KOTA', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Rajasthan' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-ghaziabad', s.id, 'Ghaziabad', 'GHAZ', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Uttar Pradesh' ON CONFLICT DO NOTHING;

INSERT INTO districts (id, state_id, name, code, is_active, created_at, updated_at)
SELECT 'dist-agra', s.id, 'Agra', 'AGRA', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM states s WHERE s.name = 'Uttar Pradesh' ON CONFLICT DO NOTHING;

-- 3. Insert Additional Master Commodities
INSERT INTO commodities (id, name, created_date, last_modified_date)
VALUES
  ('comm-bitter-gourd', 'Bitter gourd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-mustard', 'Mustard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-ginger', 'Ginger', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-jute', 'Jute', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-cumin', 'Cumin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-soybean', 'Soybean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-basmati-rice', 'Basmati Rice', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-black-pepper', 'Black Pepper', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-garlic', 'Garlic', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-cardamom', 'Cardamom', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-apple', 'Apple', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- 4. Insert APMC Markets for Non-Karnataka States
INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-pamohi-assam', 'Pamohi(Garchuk) APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'kamrup' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-kharupetia-assam', 'Kharupetia APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'darrang' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-silchar-assam', 'Silchar APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'cachar' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-lasalgaon-mh', 'Lasalgaon APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'nashik' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-vashi-mh', 'Vashi APMC (Navi Mumbai)', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'thane' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-khanna-pb', 'Khanna APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'ludhiana' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-unjha-gj', 'Unjha APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'mehsana' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-jaipur-rj', 'Jaipur APMC (Muhana Mandi)', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'jaipur' LIMIT 1 ON CONFLICT DO NOTHING;

INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
SELECT 'mkt-sahibabad-up', 'Sahibabad APMC', d.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM districts d WHERE LOWER(d.name) = 'ghaziabad' LIMIT 1 ON CONFLICT DO NOTHING;

-- 5. Seed Pan-India Current APMC Market Prices
INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT 
  gen_random_uuid()::varchar, c.id, m.id, CURRENT_DATE,
  3500, 4000, 3750, 'Bitter Gourd', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM commodities c, markets m WHERE c.name = 'Bitter gourd' AND m.name LIKE '%Pamohi%' ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT 
  gen_random_uuid()::varchar, c.id, m.id, CURRENT_DATE,
  5400, 6100, 5800, 'Local', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM commodities c, markets m WHERE c.name = 'Mustard' AND m.name LIKE '%Pamohi%' ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT 
  gen_random_uuid()::varchar, c.id, m.id, CURRENT_DATE,
  5800, 6500, 6200, 'TD-5', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM commodities c, markets m WHERE c.name = 'Jute' AND m.name LIKE '%Kharupetia%' ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT 
  gen_random_uuid()::varchar, c.id, m.id, CURRENT_DATE,
  2200, 3000, 2600, 'Red Onion', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM commodities c, markets m WHERE c.name = 'Onion' AND m.name LIKE '%Lasalgaon%' ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT 
  gen_random_uuid()::varchar, c.id, m.id, CURRENT_DATE,
  2350, 2550, 2450, 'HD-2967', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM commodities c, markets m WHERE c.name = 'Wheat' AND m.name LIKE '%Khanna%' ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT 
  gen_random_uuid()::varchar, c.id, m.id, CURRENT_DATE,
  26000, 31000, 28500, 'Jeera Gujarat-4', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM commodities c, markets m WHERE c.name = 'Cumin' AND m.name LIKE '%Unjha%' ON CONFLICT DO NOTHING;
