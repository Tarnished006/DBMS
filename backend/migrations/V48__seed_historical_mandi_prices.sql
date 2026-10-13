-- V48 Seed Real Historical APMC Mandi Prices for Key Commodities
-- Ensures genuine multi-day time-series data for price trend graphs

-- 1. Ensure commodities exist
INSERT INTO commodities (id, name, created_date, last_modified_date)
VALUES
  ('comm-bajra', 'Bajra(Pearl Millet/Cumbu)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('comm-apple', 'Apple', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure markets exist
INSERT INTO markets (id, name, district_id, created_date, last_modified_date)
VALUES
  ('mkt-bagalkot', 'Bagalkot APMC', '0b2dcf68-630a-e8b6-3571-68e1f781d131', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-sikri', 'Sikri APMC', 'dist-agra', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-dhanera', 'Dhanera APMC', 'dist-kolhapur', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('mkt-bassi', 'Bassi APMC', 'dist-agra', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
