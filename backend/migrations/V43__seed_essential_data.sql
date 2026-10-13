-- V43: Seed Essential Roles and Agricultural Advisory Crop Data

-- 1. Ensure Standard Security Roles
INSERT INTO roles (id, name, created_date, last_modified_date)
VALUES 
    ('role-user-001', 'ROLE_USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('role-admin-002', 'ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Standard Karnataka Crop Info Guides
INSERT INTO crop_info (
    id, crop_name, scientific_name, description, image_url, life_cycle,
    growth_stages, sowing_info, growing_duration, harvesting_info,
    water_requirements, temperature_requirements, created_date, last_modified_date
) VALUES 
(
    'crop-paddy-rice-01',
    'Paddy (Rice)',
    'Oryza sativa',
    'Staple cereal grain crop of Karnataka, widely cultivated in irrigated plains and river basins like Cauvery and Tungabhadra.',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    'ANNUAL',
    'Germination (10d), Tillering (35d), Panicle Initiation (65d), Flowering (85d), Grain Maturity (115d)',
    'Nursery sowing in June-July, transplanting 21-25 day old seedlings with 20x10 cm spacing.',
    '120-135 Days',
    'Harvest when 80-85% of panicles turn golden yellow and grain moisture is around 20%.',
    'High (Standing water 2-5 cm during tillering)',
    '20°C - 35°C',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'crop-tomato-02',
    'Tomato',
    'Solanum lycopersicum',
    'Major horticultural cash crop extensively grown in Kolar, Chikkaballapura, and Belagavi districts.',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    'ANNUAL',
    'Seedling (25d), Vegetative (45d), Flowering & Fruit Set (70d), Harvesting (90-120d)',
    'Raised bed nursery, transplanted at 60x45 cm spacing with staking support.',
    '90-110 Days',
    'Harvest at breaker stage for long-distance transport, or red-ripe stage for local processing.',
    'Moderate (Regular drip irrigation avoiding waterlogging)',
    '18°C - 30°C',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'crop-ragi-millet-03',
    'Ragi (Finger Millet)',
    'Eleusine coracana',
    'Drought-hardy superfood grain indigenous to Southern Karnataka (Old Mysuru region), rich in calcium and dietary fiber.',
    'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=600&q=80',
    'ANNUAL',
    'Emergence (7d), Tillering (30d), Boot leaf (55d), Grain development (80d), Maturity (105d)',
    'Direct broadcasting or line sowing in July-August after first monsoon showers.',
    '100-115 Days',
    'Cut earheads when grains become hard and earheads turn brown. Sun dry and thresh.',
    'Low (Extremely drought tolerant rainfed crop)',
    '15°C - 32°C',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'crop-cotton-04',
    'Cotton (Kapas)',
    'Gossypium hirsutum',
    'Primary commercial fiber crop grown predominantly in the black soils of Northern Karnataka (Dharwad, Raichur, Haveri).',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    'ANNUAL',
    'Emergence (8d), Square formation (40d), Flowering (65d), Boll development (100d), Boll bursting (135d)',
    'Sow dibbled on ridges with 90x60 cm spacing during pre-monsoon May-June.',
    '150-170 Days',
    'Pick clean opened bolls in dry sunny mornings in 3-4 pickings.',
    'Moderate (Sensitive to waterlogging, requires dry boll bursting season)',
    '22°C - 34°C',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (crop_name) DO NOTHING;

-- 3. Seed Crop Common Diseases
INSERT INTO crop_info_common_diseases (crop_info_id, disease) VALUES
    ('crop-paddy-rice-01', 'Paddy Blast (Magnaporthe oryzae)'),
    ('crop-paddy-rice-01', 'Bacterial Leaf Blight (Xanthomonas oryzae)'),
    ('crop-paddy-rice-01', 'Brown Spot (Bipolaris oryzae)'),
    ('crop-tomato-02', 'Early Blight (Alternaria solani)'),
    ('crop-tomato-02', 'Tomato Leaf Curl Virus (ToLCV)'),
    ('crop-tomato-02', 'Bacterial Wilt (Ralstonia solanacearum)'),
    ('crop-ragi-millet-03', 'Ragi Blast (Pyricularia grisea)'),
    ('crop-ragi-millet-03', 'Foot Rot & Seedling Blight'),
    ('crop-cotton-04', 'American Bollworm (Helicoverpa armigera)'),
    ('crop-cotton-04', 'Cotton Leaf Curl Virus'),
    ('crop-cotton-04', 'Fusarium Wilt')
ON CONFLICT DO NOTHING;

-- 4. Seed Crop Uses
INSERT INTO crop_info_uses (crop_info_id, use_case) VALUES
    ('crop-paddy-rice-01', 'Primary staple food grain for household consumption'),
    ('crop-paddy-rice-01', 'Rice bran oil extraction for cooking & cosmetic applications'),
    ('crop-paddy-rice-01', 'Paddy straw utilized as livestock feed and organic mulching'),
    ('crop-tomato-02', 'Direct culinary fresh vegetable cooking and salads'),
    ('crop-tomato-02', 'Industrial processing into purees, ketchups, and sauces'),
    ('crop-ragi-millet-03', 'Traditional nutritious Ragi Mudde, rotis, and porridge'),
    ('crop-ragi-millet-03', 'Malted health food and weaning baby formulations'),
    ('crop-cotton-04', 'Raw fiber spinning for textile and apparel manufacturing'),
    ('crop-cotton-04', 'Cottonseed crushing for cooking oil and high-protein cattle feed meal')
ON CONFLICT DO NOTHING;
