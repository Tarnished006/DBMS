-- V47 Seed All India States
INSERT INTO states (id, name, code, country_code, is_active, created_date, last_modified_date)
VALUES
  ('state-andhra-pradesh', 'Andhra Pradesh', 'AP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-assam', 'Assam', 'AS', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-bihar', 'Bihar', 'BR', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-chandigarh', 'Chandigarh', 'CH', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-chhattisgarh', 'Chhattisgarh', 'CG', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-delhi', 'Delhi', 'DL', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-goa', 'Goa', 'GA', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-gujarat', 'Gujarat', 'GJ', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-haryana', 'Haryana', 'HR', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-himachal-pradesh', 'Himachal Pradesh', 'HP', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-jammu-and-kashmir', 'Jammu and Kashmir', 'JK', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-jharkhand', 'Jharkhand', 'JH', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-kerala', 'Kerala', 'KL', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-odisha', 'Odisha', 'OD', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-rajasthan', 'Rajasthan', 'RJ', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-tamil-nadu', 'Tamil Nadu', 'TN', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-telangana', 'Telangana', 'TS', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-uttarakhand', 'Uttarakhand', 'UK', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-west-bengal', 'West Bengal', 'WB', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-tripura', 'Tripura', 'TR', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('state-meghalaya', 'Meghalaya', 'ML', 'IN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
