-- V46 Seed Multi-State APMCs (Maharashtra, Uttar Pradesh, Punjab, Madhya Pradesh)
-- Ensures all states supported by the frontend have rich APMC market rates

-- 1. Insert States
INSERT INTO states (id, name, code, country_code, is_active, created_date, last_modified_date)
VALUES
  ('state-maharashtra', 'Maharashtra', 'MH', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-uttar-pradesh', 'Uttar Pradesh', 'UP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-punjab', 'Punjab', 'PB', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-madhya-pradesh', 'Madhya Pradesh', 'MP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 2. Insert Key Agricultural Districts
INSERT INTO districts (id, name, state_id, code, created_date, last_modified_date)
VALUES
  -- Maharashtra
  ('dist-kolhapur', 'Kolhapur', 'state-maharashtra', 'KLP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-pune', 'Pune', 'state-maharashtra', 'PUN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-nashik', 'Nashik', 'state-maharashtra', 'NSK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-nagpur', 'Nagpur', 'state-maharashtra', 'NGP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Uttar Pradesh
  ('dist-agra', 'Agra', 'state-uttar-pradesh', 'AGR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-lucknow', 'Lucknow', 'state-uttar-pradesh', 'LKO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-varanasi', 'Varanasi', 'state-uttar-pradesh', 'VNS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-kanpur', 'Kanpur Nagar', 'state-uttar-pradesh', 'KNP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Punjab
  ('dist-ludhiana', 'Ludhiana', 'state-punjab', 'LDH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-amritsar', 'Amritsar', 'state-punjab', 'ASR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-bathinda', 'Bathinda', 'state-punjab', 'BTI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Madhya Pradesh
  ('dist-indore', 'Indore', 'state-madhya-pradesh', 'IDR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-bhopal', 'Bhopal', 'state-madhya-pradesh', 'BPL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dist-ujjain', 'Ujjain', 'state-madhya-pradesh', 'UJN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 3. Insert APMC Markets
INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
VALUES
  -- Maharashtra Markets
  ('mkt-kolhapur-apmc', 'APMC Kolhapur', 'dist-kolhapur', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-pune-apmc', 'Pune APMC (Gultekdi)', 'dist-pune', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-nashik-apmc', 'Lasalgaon / Nashik APMC', 'dist-nashik', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-nagpur-apmc', 'Nagpur Orange Mandi APMC', 'dist-nagpur', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- UP Markets
  ('mkt-agra-apmc', 'Agra Potato Mandi APMC', 'dist-agra', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-lucknow-apmc', 'Lucknow Wholesale APMC', 'dist-lucknow', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-varanasi-apmc', 'Varanasi APMC', 'dist-varanasi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- Punjab Markets
  ('mkt-ludhiana-apmc', 'Ludhiana Grain Mandi APMC', 'dist-ludhiana', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-amritsar-apmc', 'Amritsar Bhagtanwala APMC', 'dist-amritsar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- MP Markets
  ('mkt-indore-apmc', 'Indore Choithram APMC', 'dist-indore', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-bhopal-apmc', 'Bhopal Karond APMC', 'dist-bhopal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 4. Insert Master Multi-State APMC Prices
-- Maharashtra Prices
INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Onion'), 'mkt-nashik-apmc', CURRENT_DATE, 2100, 2900, 2550, 'Nasik Red', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Paddy (Dhan)'), 'mkt-kolhapur-apmc', CURRENT_DATE, 3400, 3900, 3700, 'Kolam', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Cotton (Kapas)'), 'mkt-nagpur-apmc', CURRENT_DATE, 6800, 7700, 7350, 'Medium Staple', 'Grade A', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Tomato'), 'mkt-pune-apmc', CURRENT_DATE, 1500, 2300, 1950, 'Hybrid Red', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

-- Uttar Pradesh Prices
INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Potato'), 'mkt-agra-apmc', CURRENT_DATE, 1200, 1650, 1450, 'Kufri Bahar', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Wheat'), 'mkt-lucknow-apmc', CURRENT_DATE, 2200, 2600, 2420, 'Dara', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Banana'), 'mkt-varanasi-apmc', CURRENT_DATE, 2400, 3200, 2800, 'Harichhal', 'Local', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

-- Punjab Prices
INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Wheat'), 'mkt-ludhiana-apmc', CURRENT_DATE, 2300, 2750, 2550, 'PBW-550', 'Grade A', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Paddy (Dhan)'), 'mkt-amritsar-apmc', CURRENT_DATE, 3500, 4200, 3900, 'Basmati 1121', 'Grade A', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

-- Madhya Pradesh Prices
INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Wheat'), 'mkt-indore-apmc', CURRENT_DATE, 2800, 3400, 3150, 'Sharbati Premium', 'Grade A', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;

INSERT INTO market_prices (id, commodity_id, market_id, arrival_date, minimum_price, maximum_price, modal_price, variety, grade, unit, currency, source, created_at, updated_at)
SELECT gen_random_uuid()::varchar, (SELECT id FROM commodities WHERE name = 'Maize'), 'mkt-bhopal-apmc', CURRENT_DATE, 1950, 2400, 2200, 'Yellow Hybrid', 'FAQ', 'Quintal', 'INR', 'Agmarknet APMC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
ON CONFLICT DO NOTHING;
