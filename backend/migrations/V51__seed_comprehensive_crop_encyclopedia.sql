-- V51: Seed Comprehensive Agricultural Crop Encyclopedia with Multi-stage Lifecycles & Disease Guides

ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS family VARCHAR(100);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS kannada_name VARCHAR(150);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS hindi_name VARCHAR(150);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS optimal_temperature_min NUMERIC(5, 2);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS optimal_temperature_max NUMERIC(5, 2);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS rainfall_min NUMERIC(7, 2);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS rainfall_max NUMERIC(7, 2);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS soil_ph VARCHAR(50);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS water_requirement TEXT;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS growth_duration_days INTEGER;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS sowing_season VARCHAR(150);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS harvest_season VARCHAR(150);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS mandi_commodity VARCHAR(100);
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS lifecycle_stages_json TEXT;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS pest_diseases_json TEXT;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS nutrient_schedule_json TEXT;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS climate_soil_json TEXT;
ALTER TABLE crop_info ADD COLUMN IF NOT EXISTS post_harvest_json TEXT;

-- Update Paddy
UPDATE crop_info SET
    family = 'Poaceae',
    category = 'Cereal Grain',
    kannada_name = 'ಬತ್ತ (Batta) / ಅಕ್ಕಿ (Akki)',
    hindi_name = 'धान (Dhaan) / चावल (Chawal)',
    optimal_temperature_min = 20,
    optimal_temperature_max = 35,
    rainfall_min = 1000,
    rainfall_max = 2000,
    soil_type = 'Clayey Loam / River Alluvial',
    soil_ph = '5.5 - 7.0',
    water_requirement = 'High (Standing water 2–5 cm during tillering)',
    growth_duration_days = 130,
    sowing_season = 'Kharif (June–July) / Rabi (Nov–Dec)',
    harvest_season = 'October–November / April–May',
    mandi_commodity = 'Rice'
WHERE id = 'crop-paddy-rice-01';

-- Update Tomato
UPDATE crop_info SET
    family = 'Solanaceae',
    category = 'Vegetable / Horticulture',
    kannada_name = 'ಟೊಮೇಟೊ (Tomato)',
    hindi_name = 'टमाटर (Tamatar)',
    optimal_temperature_min = 18,
    optimal_temperature_max = 30,
    rainfall_min = 600,
    rainfall_max = 1200,
    soil_type = 'Sandy Loam / Red Loam with Drip',
    soil_ph = '6.0 - 7.0',
    water_requirement = 'Moderate (Regular drip irrigation avoiding waterlogging)',
    growth_duration_days = 110,
    sowing_season = 'Round-the-year in Karnataka',
    harvest_season = '90–120 days after transplanting',
    mandi_commodity = 'Tomato'
WHERE id = 'crop-tomato-02';

-- Update Ragi
UPDATE crop_info SET
    family = 'Poaceae',
    category = 'Nutri-Cereal / Millet',
    kannada_name = 'ರಾಗಿ (Ragi)',
    hindi_name = 'मंडुआ (Mandua) / रागी (Ragi)',
    optimal_temperature_min = 15,
    optimal_temperature_max = 32,
    rainfall_min = 450,
    rainfall_max = 800,
    soil_type = 'Red Sandy Loam / Gravelly Loam',
    soil_ph = '5.5 - 7.5',
    water_requirement = 'Low (Extremely drought tolerant rainfed crop)',
    growth_duration_days = 110,
    sowing_season = 'Kharif (July–August)',
    harvest_season = 'October–November',
    mandi_commodity = 'Ragi (Finger Millet)'
WHERE id = 'crop-ragi-millet-03';

-- Update Cotton
UPDATE crop_info SET
    family = 'Malvaceae',
    category = 'Fiber / Commercial Cash Crop',
    kannada_name = 'ಹತ್ತಿ (Hatti)',
    hindi_name = 'कपास (Kapas)',
    optimal_temperature_min = 21,
    optimal_temperature_max = 35,
    rainfall_min = 500,
    rainfall_max = 850,
    soil_type = 'Deep Black Cotton Soil (Regur)',
    soil_ph = '6.5 - 8.0',
    water_requirement = 'Medium (Sensitive to waterlogging, requires dry boll bursting period)',
    growth_duration_days = 165,
    sowing_season = 'Kharif (May–June)',
    harvest_season = 'October to January',
    mandi_commodity = 'Cotton'
WHERE id = 'crop-cotton-04';

-- Insert Remaining Staple Crops
INSERT INTO crop_info (
    id, crop_name, scientific_name, family, category, kannada_name, hindi_name,
    description, image_url, optimal_temperature_min, optimal_temperature_max,
    rainfall_min, rainfall_max, soil_type, soil_ph, water_requirement, growth_duration_days,
    life_cycle, sowing_season, harvest_season, mandi_commodity, created_date, last_modified_date
) VALUES
(
    'crop-wheat-05',
    'Wheat (Gehun)',
    'Triticum aestivum',
    'Poaceae',
    'Cereal Grain',
    'ಗೋಧಿ (Godhi)',
    'गेहूं (Gehun)',
    'Premier cool-season Rabi staple grain cultivated across North Karnataka and Pan-India plains.',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    12, 25, 350, 700,
    'Fertile Loam / Clay Loam', '6.0 - 7.5', 'Medium (4–6 critical stage irrigations)', 120,
    'ANNUAL', 'Rabi (Late Oct - mid-Nov)', 'March–April', 'Wheat',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-maize-06',
    'Maize (Corn)',
    'Zea mays',
    'Poaceae',
    'Coarse Cereal / Feed',
    'ಮೆಕ್ಕೆಜೋಳ (Mekke Jola)',
    'मक्का (Makka)',
    'High-yielding Miracle C4 crop grown in Davanagere and Belagavi as primary poultry feed and starch feedstock.',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    18, 35, 500, 900,
    'Deep Well-Drained Fertile Loam', '6.5 - 7.5', 'Medium (Sensitive to waterlogging)', 110,
    'ANNUAL', 'Kharif (June–July) / Rabi (October)', 'September–October / February', 'Maize',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-redgram-07',
    'Red Gram / Pigeon Pea (Tur)',
    'Cajanus cajan',
    'Fabaceae',
    'Pulse / Legume',
    'ತೊಗರಿ (Togari)',
    'अरहर (Arhar) / तूर (Tur)',
    'Vital high-protein dietary pulse of Karnataka (Kalaburagi GI tagged Tur bowl).',
    'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80',
    18, 35, 600, 1000,
    'Deep Black Soil / Well-Drained Red Loam', '6.5 - 7.5', 'Low (Deep taproot drought escaper)', 160,
    'ANNUAL', 'Kharif (June–July)', 'December–January', 'Arhar (Tur/Red Gram)(Whole)',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-onion-08',
    'Onion',
    'Allium cepa',
    'Amaryllidaceae',
    'Vegetable / Bulb Crop',
    'ಈರುಳ್ಳಿ (Eerulli)',
    'प्याज (Pyaz)',
    'Major bulb vegetable and export commodity grown across Hubballi, Gadag, and Bagalkote.',
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    13, 30, 500, 800,
    'Deep Fertile Sandy Loam', '6.0 - 7.2', 'Moderate (Frequent light irrigations)', 125,
    'BIENNIAL', 'Kharif (June–July) / Rabi (Oct–Nov)', 'October–November / March–April', 'Onion',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-potato-09',
    'Potato',
    'Solanum tuberosum',
    'Solanaceae',
    'Vegetable / Tuber',
    'ಆಲೂಗಡ್ಡೆ (Alugadde)',
    'आलू (Aloo)',
    'Essential tuber food crop cultivated extensively in Hassan, Kolar, and Belagavi.',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    15, 24, 400, 800,
    'Well-Drained Sandy Loam with Humus', '5.2 - 6.5', 'High (Frequent light furrow irrigations)', 100,
    'ANNUAL', 'Kharif (June–July in Hassan) / Rabi', 'September–October / Feb', 'Potato',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-chilli-10',
    'Chilli (Green & Red)',
    'Capsicum annuum',
    'Solanaceae',
    'Spices & Condiments',
    'ಮೆಣಸಿನಕಾಯಿ (Menasinakai) - ಬ್ಯಾಡಗಿ',
    'मिर्च (Mirchi)',
    'World-renowned commercial spice crop famous for GI-tagged Byadagi Chilli.',
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
    18, 32, 600, 1000,
    'Deep Black Cotton Soil / Red Loam', '6.5 - 7.5', 'Moderate (Sensitive to standing water)', 150,
    'ANNUAL', 'Kharif (June–July) / Summer (Jan)', 'October to February', 'Chilli Red',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-sugarcane-11',
    'Sugarcane',
    'Saccharum officinarum',
    'Poaceae',
    'Commercial Cash Crop',
    'ಕಬ್ಬು (Kabbu)',
    'गन्ना (Ganna)',
    'Giant perennial grass and primary sugar/jaggery crop of Mandya and Belagavi.',
    'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    20, 38, 1200, 2000,
    'Deep Heavy Loam / Canal Alluvium', '6.5 - 7.5', 'Very High (1500–2000 mm over season)', 360,
    'PERENNIAL', 'Adsali / Eksali / Pre-seasonal', '10–14 months after planting', 'Sugarcane',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-turmeric-12',
    'Turmeric',
    'Curcuma longa',
    'Zingiberaceae',
    'Spices & Medicinal',
    'ಅರಿಶಿನ (Arishina)',
    'हल्दी (Haldi)',
    'Sacred golden spice and high-value medicinal rhizome crop grown in Chamarajanagar and Belagavi.',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    20, 35, 1200, 2000,
    'Deep Well-Drained Sandy Loam with Humus', '5.5 - 7.5', 'High (Frequent light watering + mulch)', 260,
    'PERENNIAL', 'May–June (Pre-monsoon)', 'January–March', 'Turmeric',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-coffee-13',
    'Coffee (Arabica & Robusta)',
    'Coffea arabica / canephora',
    'Rubiaceae',
    'Plantation Beverage',
    'ಕಾಫಿ (Kaapi)',
    'कॉफी (Coffee)',
    'Heritage shade-grown plantation beverage crop of the Western Ghats (Kodagu, Chikkamagaluru, Hassan).',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    15, 28, 1500, 2500,
    'Deep Humus-Rich Forest Loam', '6.0 - 6.5', 'High (Shade-regulated; blossom showers)', 365,
    'PERENNIAL', 'Planting in monsoon (June–Aug)', 'November to February', 'Coffee',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'crop-mango-14',
    'Mango',
    'Mangifera indica',
    'Anacardiaceae',
    'Horticultural Fruit Orchard',
    'ಮಾವು (Maavu) - ಆಲ್ಫೋನ್ಸೋ / ಬಾದಾಮಿ',
    'आम (Aam)',
    'National Fruit of India and premier orchard crop celebrating Badami/Alphonso in Kolar and Dharwad.',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    22, 38, 750, 1500,
    'Deep Well-Drained Alluvial / Red Sandy Loam', '5.5 - 7.5', 'Moderate (Withhold in winter; irrigate in fruit set)', 365,
    'PERENNIAL', 'Graft planting during monsoon', 'April to July', 'Mango',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (crop_name) DO NOTHING;
