-- V49 Seed Comprehensive Pan-India Agricultural Marketplace Catalog
-- 34 Master Agricultural Products spanning Seeds, Fertilizers, Pesticides, Farm Equipment, Harvested Farm Produce, and Pre-Harvested Contracts

DO $$
DECLARE
    admin_id VARCHAR(36);
    cat_seeds VARCHAR(36);
    cat_fert VARCHAR(36);
    cat_pest VARCHAR(36);
    cat_equip VARCHAR(36);
    cat_harvest VARCHAR(36);
    cat_preharvest VARCHAR(36);
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@agrimarket.com' LIMIT 1;
    IF admin_id IS NULL THEN
        admin_id := '38b5459e-f2de-4f86-be60-f0bd926020ec';
    END IF;

    SELECT id INTO cat_seeds FROM categories WHERE name = 'Seeds' LIMIT 1;
    SELECT id INTO cat_fert FROM categories WHERE name = 'Fertilizers' LIMIT 1;
    SELECT id INTO cat_pest FROM categories WHERE name = 'Pesticides' LIMIT 1;
    SELECT id INTO cat_equip FROM categories WHERE name = 'Farm Equipment' LIMIT 1;
    SELECT id INTO cat_harvest FROM categories WHERE name = 'Harvested Products' LIMIT 1;
    SELECT id INTO cat_preharvest FROM categories WHERE name = 'Pre-Harvested Products' LIMIT 1;

    -- Organic Sona Masoori Paddy Seeds (BPT-5204)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-sona-masoori-seed', 'Sindhanur, Raichur', 'Sindhanur', 'Raichur', 'Karnataka', '584128', 'India', 15.7667, 76.7556, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-sona-masoori-seed', admin_id, cat_seeds, 'Organic Sona Masoori Paddy Seeds (BPT-5204)', 'Certified foundation seed with 95% germination rate, fine grain, and high resistance to blast and bacterial leaf blight. Matures in 135-140 days.', 1450, 'BAG (25KG)', 250, 'Sindhanur, Raichur, Karnataka', 'ACTIVE', 'snap-prod-sona-masoori-seed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 1450, quantity = 250, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-sona-masoori-seed', 'prod-sona-masoori-seed', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-sona-masoori-seed', 'prod-sona-masoori-seed', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Pusa Basmati 1121 Certified Paddy Seeds
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-basmati-1121-seed', 'Khanna, Ludhiana', 'Khanna', 'Ludhiana', 'Punjab', '141401', 'India', 30.7068, 76.2197, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-basmati-1121-seed', admin_id, cat_seeds, 'Pusa Basmati 1121 Certified Paddy Seeds', 'World-famous extra-long slender grain basmati rice seed (Pusa 1121). High aroma, elongates up to 2.5 times upon cooking. 140-145 days duration.', 2100, 'BAG (20KG)', 180, 'Khanna, Ludhiana, Punjab', 'ACTIVE', 'snap-prod-basmati-1121-seed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 2100, quantity = 180, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-basmati-1121-seed', 'prod-basmati-1121-seed', 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-basmati-1121-seed', 'prod-basmati-1121-seed', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Hybrid F1 Tomato Seeds (Arka Rakshak - High Yield)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-tomato-hybrid-seed', 'Mulbagal, Kolar', 'Mulbagal', 'Kolar', 'Karnataka', '563131', 'India', 13.1611, 78.3944, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-tomato-hybrid-seed', admin_id, cat_seeds, 'Hybrid F1 Tomato Seeds (Arka Rakshak - High Yield)', 'Triple disease resistant F1 hybrid developed by IIHR (resistant to ToLCV, BW, and Early Blight). Yield potential 75-80 tons/ha with firm square-round fruits.', 850, 'PACK (10G)', 500, 'Mulbagal, Kolar, Karnataka', 'ACTIVE', 'snap-prod-tomato-hybrid-seed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 850, quantity = 500, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-tomato-hybrid-seed', 'prod-tomato-hybrid-seed', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-tomato-hybrid-seed', 'prod-tomato-hybrid-seed', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Certified Sharbati Wheat Seeds (HD-2967 / WH-1105)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-wheat-hd2967-seed', 'Samrala, Ludhiana', 'Samrala', 'Ludhiana', 'Punjab', '141114', 'India', 30.8333, 76.1833, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-wheat-hd2967-seed', admin_id, cat_seeds, 'Certified Sharbati Wheat Seeds (HD-2967 / WH-1105)', 'High-tillering, lodging-tolerant dwarf wheat seed with golden lustrous grains and 12.5% protein content. Recommended for timely sown irrigated conditions.', 1850, 'BAG (40KG)', 320, 'Samrala, Ludhiana, Punjab', 'ACTIVE', 'snap-prod-wheat-hd2967-seed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 1850, quantity = 320, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-wheat-hd2967-seed', 'prod-wheat-hd2967-seed', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-wheat-hd2967-seed', 'prod-wheat-hd2967-seed', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Pioneer High-Yield Hybrid Corn/Maize Seeds (P-3396)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-maize-pioneer-seed', 'Niphad, Nashik', 'Niphad', 'Nashik', 'Maharashtra', '422303', 'India', 20.0833, 74.1167, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-maize-pioneer-seed', admin_id, cat_seeds, 'Pioneer High-Yield Hybrid Corn/Maize Seeds (P-3396)', 'Premium yellow hybrid maize seed with deep orange kernels, high shellability, and superior drought tolerance. Suitable for both grain and silage production.', 1200, 'BAG (5KG)', 400, 'Niphad, Nashik, Maharashtra', 'ACTIVE', 'snap-prod-maize-pioneer-seed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 1200, quantity = 400, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-maize-pioneer-seed', 'prod-maize-pioneer-seed', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-maize-pioneer-seed', 'prod-maize-pioneer-seed', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Byadgi Chilli Seeds (Dabbi & Kaddi Selection)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-byadgi-chilli-seed', 'Byadagi, Dharwad', 'Byadagi', 'Dharwad', 'Karnataka', '581106', 'India', 14.6833, 75.4833, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-byadgi-chilli-seed', admin_id, cat_seeds, 'Byadgi Chilli Seeds (Dabbi & Kaddi Selection)', 'Authentic Karnataka Byadgi red chilli seeds famous for deep red oleoresin color (ASTA 150-180) and gentle pungency (15,000 SHU). Ideal for commercial drying.', 650, 'PACK (50G)', 220, 'Byadagi, Dharwad, Karnataka', 'ACTIVE', 'snap-prod-byadgi-chilli-seed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 650, quantity = 220, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-byadgi-chilli-seed', 'prod-byadgi-chilli-seed', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-byadgi-chilli-seed', 'prod-byadgi-chilli-seed', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Pure Neem Cake Organic Fertilizer (De-Oiled Meal)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-organic-neem-fert', 'Tiptur, Tumakuru', 'Tiptur', 'Tumakuru', 'Karnataka', '572201', 'India', 13.2556, 76.4789, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-organic-neem-fert', admin_id, cat_fert, 'Pure Neem Cake Organic Fertilizer (De-Oiled Meal)', '100% natural cold-pressed neem cake meal rich in NPK, sulfur, and Azadirachtin. Protects root systems against plant-parasitic nematodes while nourishing soil microbes.', 850, 'BAG (50KG)', 350, 'Tiptur, Tumakuru, Karnataka', 'ACTIVE', 'snap-prod-organic-neem-fert', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 850, quantity = 350, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-organic-neem-fert', 'prod-organic-neem-fert', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-organic-neem-fert', 'prod-organic-neem-fert', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Water Soluble NPK 19:19:19 Foliar & Drip Fertilizer
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-npk-19-19-19-fert', 'Devanahalli, Bengaluru Rural', 'Devanahalli', 'Bengaluru Rural', 'Karnataka', '562110', 'India', 13.2483, 77.7126, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-npk-19-19-19-fert', admin_id, cat_fert, 'Water Soluble NPK 19:19:19 Foliar & Drip Fertilizer', '100% water-soluble balanced NPK formulation for foliar spray and fertigation. Enhances root development, vegetative lushness, and crop vigor across all growth stages.', 1450, 'BAG (25KG)', 200, 'Devanahalli, Bengaluru Rural, Karnataka', 'ACTIVE', 'snap-prod-npk-19-19-19-fert', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 1450, quantity = 200, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-npk-19-19-19-fert', 'prod-npk-19-19-19-fert', 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-npk-19-19-19-fert', 'prod-npk-19-19-19-fert', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Premium Enriched Vermicompost (Eisenia Fetida Organic Humus)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-vermicompost-humus', 'Nanjangud, Mysuru', 'Nanjangud', 'Mysuru', 'Karnataka', '571301', 'India', 12.1167, 76.6833, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-vermicompost-humus', admin_id, cat_fert, 'Premium Enriched Vermicompost (Eisenia Fetida Organic Humus)', 'High-grade vermicompost enriched with beneficial mycorrhiza and beneficial bacteria. Improves soil aeration, water retention capacity, and cation exchange.', 450, 'BAG (40KG)', 500, 'Nanjangud, Mysuru, Karnataka', 'ACTIVE', 'snap-prod-vermicompost-humus', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 450, quantity = 500, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-vermicompost-humus', 'prod-vermicompost-humus', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-vermicompost-humus', 'prod-vermicompost-humus', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- IFFCO Nano Urea Liquid (500ml - Replaces 1 Bag Urea)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-nano-urea-liquid', 'Yeshwanthpur, Bengaluru Urban', 'Yeshwanthpur', 'Bengaluru Urban', 'Karnataka', '560022', 'India', 13.0285, 77.5414, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-nano-urea-liquid', admin_id, cat_fert, 'IFFCO Nano Urea Liquid (500ml - Replaces 1 Bag Urea)', 'Revolutionary nanotechnology-based liquid nitrogen fertilizer with 80%+ absorption efficiency. Environmentally friendly, reduces greenhouse emissions and groundwater nitrate pollution.', 225, 'BOTTLE (500ML)', 600, 'Yeshwanthpur, Bengaluru Urban, Karnataka', 'ACTIVE', 'snap-prod-nano-urea-liquid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 225, quantity = 600, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-nano-urea-liquid', 'prod-nano-urea-liquid', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-nano-urea-liquid', 'prod-nano-urea-liquid', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Granular DAP (Di-Ammonium Phosphate 18:46:0)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-dap-granular-fert', 'Channarayapatna, Hassan', 'Channarayapatna', 'Hassan', 'Karnataka', '573116', 'India', 12.9056, 76.3889, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-dap-granular-fert', admin_id, cat_fert, 'Granular DAP (Di-Ammonium Phosphate 18:46:0)', 'Essential basal fertilizer supplying 18% Ammoniacal Nitrogen and 46% Available Phosphate (P2O5). Fosters rapid root proliferation and early seedling establishment.', 1350, 'BAG (50KG)', 280, 'Channarayapatna, Hassan, Karnataka', 'ACTIVE', 'snap-prod-dap-granular-fert', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 1350, quantity = 280, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-dap-granular-fert', 'prod-dap-granular-fert', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-dap-granular-fert', 'prod-dap-granular-fert', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Concentrated Seaweed Extract Bio-Stimulant (Kelp Enzyme Liquid)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-seaweed-extract-fert', 'Mangalore, Dakshina Kannada', 'Mangalore', 'Dakshina Kannada', 'Karnataka', '575001', 'India', 12.9141, 74.856, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-seaweed-extract-fert', admin_id, cat_fert, 'Concentrated Seaweed Extract Bio-Stimulant (Kelp Enzyme Liquid)', 'Cold-processed Ascophyllum nodosum liquid bio-stimulant packed with natural cytokinins, auxins, and 60+ trace minerals to prevent flower drop and boost fruit sizing.', 780, 'LITER', 150, 'Mangalore, Dakshina Kannada, Karnataka', 'ACTIVE', 'snap-prod-seaweed-extract-fert', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 780, quantity = 150, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-seaweed-extract-fert', 'prod-seaweed-extract-fert', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-seaweed-extract-fert', 'prod-seaweed-extract-fert', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Cold-Pressed Neem Oil (10,000 PPM Azadirachtin Bio-Pesticide)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-neem-oil-10000ppm', 'Nelamangala, Bengaluru Rural', 'Nelamangala', 'Bengaluru Rural', 'Karnataka', '562123', 'India', 13.0983, 77.3878, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-neem-oil-10000ppm', admin_id, cat_pest, 'Cold-Pressed Neem Oil (10,000 PPM Azadirachtin Bio-Pesticide)', 'Certified organic broad-spectrum botanical insecticide and insect growth regulator. Repels aphids, whiteflies, thrips, and mites without harming pollinating bees or earthworms.', 620, 'LITER', 240, 'Nelamangala, Bengaluru Rural, Karnataka', 'ACTIVE', 'snap-prod-neem-oil-10000ppm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 620, quantity = 240, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-neem-oil-10000ppm', 'prod-neem-oil-10000ppm', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-neem-oil-10000ppm', 'prod-neem-oil-10000ppm', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Trichoderma Viride Bio-Fungicide (2x10^8 CFU/g WP)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-trichoderma-bio-fungicide', 'Hubballi, Dharwad', 'Hubballi', 'Dharwad', 'Karnataka', '580020', 'India', 15.3647, 75.124, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-trichoderma-bio-fungicide', admin_id, cat_pest, 'Trichoderma Viride Bio-Fungicide (2x10^8 CFU/g WP)', 'Antagonistic fungal formulation that controls seed and soil-borne diseases such as root rot, collar rot, damping off, and Fusarium wilt in all field and vegetable crops.', 240, 'PACK (1KG)', 350, 'Hubballi, Dharwad, Karnataka', 'ACTIVE', 'snap-prod-trichoderma-bio-fungicide', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 240, quantity = 350, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-trichoderma-bio-fungicide', 'prod-trichoderma-bio-fungicide', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-trichoderma-bio-fungicide', 'prod-trichoderma-bio-fungicide', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Emamectin Benzoate 5% SG (Caterpillar & Bollworm Specialist)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-emamectin-benzoate-sg', 'Maddur, Mandya', 'Maddur', 'Mandya', 'Karnataka', '571428', 'India', 12.5833, 77.05, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-emamectin-benzoate-sg', admin_id, cat_pest, 'Emamectin Benzoate 5% SG (Caterpillar & Bollworm Specialist)', 'Translaminar water-soluble granule derived from natural Avermectins. Highly effective against Helicoverpa, Spodoptera, diamondback moth, and shoot & fruit borers.', 480, 'PACK (100G)', 190, 'Maddur, Mandya, Karnataka', 'ACTIVE', 'snap-prod-emamectin-benzoate-sg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 480, quantity = 190, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-emamectin-benzoate-sg', 'prod-emamectin-benzoate-sg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-emamectin-benzoate-sg', 'prod-emamectin-benzoate-sg', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Copper Oxychloride 50% WP (Broad-Spectrum Contact Fungicide)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-copper-oxychloride-wp', 'Bhadravathi, Shivamogga', 'Bhadravathi', 'Shivamogga', 'Karnataka', '577301', 'India', 13.8447, 75.7039, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-copper-oxychloride-wp', admin_id, cat_pest, 'Copper Oxychloride 50% WP (Broad-Spectrum Contact Fungicide)', 'Trusted copper-based bactericide and fungicide for downy mildew, late blight, anthracnose, leaf spot, and canker control across vegetable, potato, and plantation crops.', 390, 'PACK (500G)', 210, 'Bhadravathi, Shivamogga, Karnataka', 'ACTIVE', 'snap-prod-copper-oxychloride-wp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 390, quantity = 210, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-copper-oxychloride-wp', 'prod-copper-oxychloride-wp', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-copper-oxychloride-wp', 'prod-copper-oxychloride-wp', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Yellow & Blue Sticky Insect Traps (Pack of 25 with Wire Ties)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-sticky-insect-traps', 'Srinivaspur, Kolar', 'Srinivaspur', 'Kolar', 'Karnataka', '563135', 'India', 13.3333, 78.2167, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-sticky-insect-traps', admin_id, cat_pest, 'Yellow & Blue Sticky Insect Traps (Pack of 25 with Wire Ties)', 'Non-toxic UV-resistant pest monitoring glue boards for mass-trapping whiteflies, winged aphids, thrips, and leaf miners in greenhouse and open field farming.', 340, 'PACK (25 PCS)', 400, 'Srinivaspur, Kolar, Karnataka', 'ACTIVE', 'snap-prod-sticky-insect-traps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 340, quantity = 400, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-sticky-insect-traps', 'prod-sticky-insect-traps', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-sticky-insect-traps', 'prod-sticky-insect-traps', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Pseudomonas Fluorescens Liquid (1% W.P. Systemic Bio-Protective)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-pseudomonas-liquid-bio', 'Gokak, Belagavi', 'Gokak', 'Belagavi', 'Karnataka', '591307', 'India', 16.1667, 74.8333, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-pseudomonas-liquid-bio', admin_id, cat_pest, 'Pseudomonas Fluorescens Liquid (1% W.P. Systemic Bio-Protective)', 'Bio-control bacterium producing phenazine antibiotics that suppress bacterial wilt, Sheath blight, and citrus canker while inducing systemic plant resistance.', 290, 'LITER', 180, 'Gokak, Belagavi, Karnataka', 'ACTIVE', 'snap-prod-pseudomonas-liquid-bio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 290, quantity = 180, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-pseudomonas-liquid-bio', 'prod-pseudomonas-liquid-bio', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-pseudomonas-liquid-bio', 'prod-pseudomonas-liquid-bio', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- 16-Liter 12V 12Ah Dual-Motor Battery Knapsack Sprayer
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-battery-knapsack-sprayer', 'Peenya Industrial Area, Bengaluru Urban', 'Peenya Industrial Area', 'Bengaluru Urban', 'Karnataka', '560058', 'India', 13.0289, 77.5256, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-battery-knapsack-sprayer', admin_id, cat_equip, '16-Liter 12V 12Ah Dual-Motor Battery Knapsack Sprayer', 'Heavy-duty electric knapsack sprayer with dual brass nozzles, telescopic stainless steel lance, regulator valve, and 6-hour continuous spraying backup per charge.', 2850, 'UNIT', 95, 'Peenya Industrial Area, Bengaluru Urban, Karnataka', 'ACTIVE', 'snap-prod-battery-knapsack-sprayer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 2850, quantity = 95, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-battery-knapsack-sprayer', 'prod-battery-knapsack-sprayer', 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-battery-knapsack-sprayer', 'prod-battery-knapsack-sprayer', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Drip Irrigation Inline Lateral Kit (1 Acre Complete Setup - 16mm)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-drip-irrigation-kit-1acre', 'Hadapsar, Pune', 'Hadapsar', 'Pune', 'Maharashtra', '411028', 'India', 18.5089, 73.9258, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-drip-irrigation-kit-1acre', admin_id, cat_equip, 'Drip Irrigation Inline Lateral Kit (1 Acre Complete Setup - 16mm)', 'Complete 1-acre micro-irrigation system with 16mm UV-treated inline drip lateral (40cm dripper spacing, 2 LPH), screen filter, venturi injector, and take-off valves.', 14800, 'KIT', 45, 'Hadapsar, Pune, Maharashtra', 'ACTIVE', 'snap-prod-drip-irrigation-kit-1acre', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 14800, quantity = 45, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-drip-irrigation-kit-1acre', 'prod-drip-irrigation-kit-1acre', 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-drip-irrigation-kit-1acre', 'prod-drip-irrigation-kit-1acre', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- 7HP 212cc Multi-Speed Petrol Power Weeder & Rotary Tiller
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-power-weeder-tiller-7hp', 'Hubballi, Dharwad', 'Hubballi', 'Dharwad', 'Karnataka', '580030', 'India', 15.35, 75.13, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-power-weeder-tiller-7hp', admin_id, cat_equip, '7HP 212cc Multi-Speed Petrol Power Weeder & Rotary Tiller', 'Powerful 4-stroke overhead valve engine with dual forward and reverse gears, 32 boron steel tilling blades, and adjustable tilling width (60-90cm). Ideal for inter-cultivation.', 38500, 'UNIT', 20, 'Hubballi, Dharwad, Karnataka', 'ACTIVE', 'snap-prod-power-weeder-tiller-7hp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 38500, quantity = 20, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-power-weeder-tiller-7hp', 'prod-power-weeder-tiller-7hp', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-power-weeder-tiller-7hp', 'prod-power-weeder-tiller-7hp', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- UV-Stabilized HDPE Agricultural Tarpaulin (250 GSM - 24ft x 18ft)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-hdpe-tarpaulin-250gsm', 'Harihar, Davanagere', 'Harihar', 'Davanagere', 'Karnataka', '577601', 'India', 14.5167, 75.8, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-hdpe-tarpaulin-250gsm', admin_id, cat_equip, 'UV-Stabilized HDPE Agricultural Tarpaulin (250 GSM - 24ft x 18ft)', 'Heavy-duty 5-layer cross-laminated waterproof sheet with reinforced aluminum eyelets. Perfect for grain threshing floor drying, greenhouse covers, and pond lining.', 2400, 'PIECE', 150, 'Harihar, Davanagere, Karnataka', 'ACTIVE', 'snap-prod-hdpe-tarpaulin-250gsm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 2400, quantity = 150, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-hdpe-tarpaulin-250gsm', 'prod-hdpe-tarpaulin-250gsm', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-hdpe-tarpaulin-250gsm', 'prod-hdpe-tarpaulin-250gsm', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- 3HP Solar Submersible DC Borewell Pump & MPPT Controller
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-solar-pump-submersible-3hp', 'Hiriyur, Chitradurga', 'Hiriyur', 'Chitradurga', 'Karnataka', '577598', 'India', 13.95, 76.6167, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-solar-pump-submersible-3hp', admin_id, cat_equip, '3HP Solar Submersible DC Borewell Pump & MPPT Controller', 'Stainless steel multistage submersible pump powered by high-efficiency brushless DC motor with intelligent MPPT automatic tracking and dry-run protection.', 62000, 'SET', 15, 'Hiriyur, Chitradurga, Karnataka', 'ACTIVE', 'snap-prod-solar-pump-submersible-3hp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 62000, quantity = 15, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-solar-pump-submersible-3hp', 'prod-solar-pump-submersible-3hp', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-solar-pump-submersible-3hp', 'prod-solar-pump-submersible-3hp', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Silver-Black Agricultural Mulching Film (25 Micron - 400m x 1.2m)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-mulching-film-silver-black', 'Bangarapet, Kolar', 'Bangarapet', 'Kolar', 'Karnataka', '563114', 'India', 12.9833, 78.2, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-mulching-film-silver-black', admin_id, cat_equip, 'Silver-Black Agricultural Mulching Film (25 Micron - 400m x 1.2m)', '100% virgin LLDPE mulching roll. Silver top repels thrips and reflects sunlight; black underside suppresses weeds, regulates soil temperature, and conserves 40% moisture.', 1850, 'ROLL', 130, 'Bangarapet, Kolar, Karnataka', 'ACTIVE', 'snap-prod-mulching-film-silver-black', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 1850, quantity = 130, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-mulching-film-silver-black', 'prod-mulching-film-silver-black', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-mulching-film-silver-black', 'prod-mulching-film-silver-black', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Premium Malnad Red Arecanut (Whole Chali / Rashi Grade)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-fresh-shimoga-arecanut', 'Thirthahalli, Shivamogga', 'Thirthahalli', 'Shivamogga', 'Karnataka', '577432', 'India', 13.6833, 75.25, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-fresh-shimoga-arecanut', admin_id, cat_harvest, 'Premium Malnad Red Arecanut (Whole Chali / Rashi Grade)', 'Direct Malnad plantation harvest. Sun-dried, cleaned, moisture-tested (under 10%), single-origin whole betel nut selected for premium processing.', 480, 'KG', 800, 'Thirthahalli, Shivamogga, Karnataka', 'ACTIVE', 'snap-prod-fresh-shimoga-arecanut', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 480, quantity = 800, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-fresh-shimoga-arecanut', 'prod-fresh-shimoga-arecanut', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-fresh-shimoga-arecanut', 'prod-fresh-shimoga-arecanut', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Export Grade Nashik Red Onions (Medium-Large 50mm+)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-nashik-red-onions', 'Lasalgaon, Nashik', 'Lasalgaon', 'Nashik', 'Maharashtra', '422306', 'India', 20.1472, 74.225, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-nashik-red-onions', admin_id, cat_harvest, 'Export Grade Nashik Red Onions (Medium-Large 50mm+)', 'Freshly sorted Lasalgaon APMC benchmark onions. High pungency, firm skin with long storage shelf-life. Cured under natural shade.', 28, 'KG', 5000, 'Lasalgaon, Nashik, Maharashtra', 'ACTIVE', 'snap-prod-nashik-red-onions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 28, quantity = 5000, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-nashik-red-onions', 'prod-nashik-red-onions', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-nashik-red-onions', 'prod-nashik-red-onions', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Kolar Semi-Ripe Hybrid Salad Tomatoes (Grade A - Fresh Harvest)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-kolar-salad-tomatoes', 'Kolar Mandi Rural, Kolar', 'Kolar Mandi Rural', 'Kolar', 'Karnataka', '563101', 'India', 13.1367, 78.1333, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-kolar-salad-tomatoes', admin_id, cat_harvest, 'Kolar Semi-Ripe Hybrid Salad Tomatoes (Grade A - Fresh Harvest)', 'Crisp, firm red hybrid tomatoes harvested at morning breaker stage. High pulp density, uniform size, perfect for culinary and commercial retail.', 32, 'KG', 2500, 'Kolar Mandi Rural, Kolar, Karnataka', 'ACTIVE', 'snap-prod-kolar-salad-tomatoes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 32, quantity = 2500, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-kolar-salad-tomatoes', 'prod-kolar-salad-tomatoes', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-kolar-salad-tomatoes', 'prod-kolar-salad-tomatoes', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Dharwad Organic Alphonso Mangoes (Carbide-Free Ripened)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-alphonso-mango-harvest', 'Alnavar, Dharwad', 'Alnavar', 'Dharwad', 'Karnataka', '581103', 'India', 15.4333, 74.7333, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-alphonso-mango-harvest', admin_id, cat_harvest, 'Dharwad Organic Alphonso Mangoes (Carbide-Free Ripened)', 'GI-tagged authentic Alphonso (Hapus) mangoes from heritage Dharwad red soil orchards. Naturally straw-ripened, intensely aromatic and rich in natural sugars.', 650, 'DOZEN', 180, 'Alnavar, Dharwad, Karnataka', 'ACTIVE', 'snap-prod-alphonso-mango-harvest', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 650, quantity = 180, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-alphonso-mango-harvest', 'prod-alphonso-mango-harvest', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-alphonso-mango-harvest', 'prod-alphonso-mango-harvest', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Premium Traditional Pusa Basmati Aged Rice (50kg Bag)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-traditional-basmati-rice-50kg', 'Rayya, Amritsar', 'Rayya', 'Amritsar', 'Punjab', '143112', 'India', 31.55, 75.2333, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-traditional-basmati-rice-50kg', admin_id, cat_harvest, 'Premium Traditional Pusa Basmati Aged Rice (50kg Bag)', '1-year naturally aged non-sticky long-grain Basmati rice. Delivers superior culinary fragrance, fluffiness, and elongation without breakage.', 4200, 'BAG (50KG)', 120, 'Rayya, Amritsar, Punjab', 'ACTIVE', 'snap-prod-traditional-basmati-rice-50kg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 4200, quantity = 120, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-traditional-basmati-rice-50kg', 'prod-traditional-basmati-rice-50kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-traditional-basmati-rice-50kg', 'prod-traditional-basmati-rice-50kg', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Pure Sharbati Golden Wheat Grain (Cleaned & Destoned - 50kg Bag)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-sharbati-wheat-grain-50kg', 'Khanna Mandi, Ludhiana', 'Khanna Mandi', 'Ludhiana', 'Punjab', '141401', 'India', 30.7068, 76.2197, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-sharbati-wheat-grain-50kg', admin_id, cat_harvest, 'Pure Sharbati Golden Wheat Grain (Cleaned & Destoned - 50kg Bag)', 'Famous Sehore / Sharbati variety whole wheat grains. Heavy, golden textured, high dietary fiber for extra soft rotis. Machine cleaned and triple destoned.', 2450, 'BAG (50KG)', 200, 'Khanna Mandi, Ludhiana, Punjab', 'ACTIVE', 'snap-prod-sharbati-wheat-grain-50kg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 2450, quantity = 200, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-sharbati-wheat-grain-50kg', 'prod-sharbati-wheat-grain-50kg', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-sharbati-wheat-grain-50kg', 'prod-sharbati-wheat-grain-50kg', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Forward Contract: 2-Acre Standing Pusa 1121 Basmati Crop (Oct-Nov Harvest)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-fwd-basmati-rice-2acres', 'Doraha, Ludhiana', 'Doraha', 'Ludhiana', 'Punjab', '141421', 'India', 30.8167, 76.0333, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-fwd-basmati-rice-2acres', admin_id, cat_preharvest, 'Forward Contract: 2-Acre Standing Pusa 1121 Basmati Crop (Oct-Nov Harvest)', 'Forward delivery agreement for 2 acres of healthy standing Basmati crop. Guaranteed moisture control under 14% at field-gate threshing. Estimated yield: 38 Quintals.', 75000, 'ACRE', 2, 'Doraha, Ludhiana, Punjab', 'ACTIVE', 'snap-prod-fwd-basmati-rice-2acres', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 75000, quantity = 2, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-fwd-basmati-rice-2acres', 'prod-fwd-basmati-rice-2acres', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-fwd-basmati-rice-2acres', 'prod-fwd-basmati-rice-2acres', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Forward Contract: 1-Acre Standing Bt-Cotton Lot (First Picking Dec)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-fwd-bt-cotton-1acre', 'Navalgund, Dharwad', 'Navalgund', 'Dharwad', 'Karnataka', '582208', 'India', 15.5667, 75.3667, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-fwd-bt-cotton-1acre', admin_id, cat_preharvest, 'Forward Contract: 1-Acre Standing Bt-Cotton Lot (First Picking Dec)', 'Forward contract for 1 acre of premium DCH-32 long-staple cotton currently in boll development. Estimated output: 14 Quintals of clean unadulterated Kapas.', 68000, 'ACRE', 1, 'Navalgund, Dharwad, Karnataka', 'ACTIVE', 'snap-prod-fwd-bt-cotton-1acre', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 68000, quantity = 1, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-fwd-bt-cotton-1acre', 'prod-fwd-bt-cotton-1acre', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-fwd-bt-cotton-1acre', 'prod-fwd-bt-cotton-1acre', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Forward Contract: High-Recovery Sugarcane Co-86032 (3-Acre Stand)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-fwd-sugarcane-3acres', 'Pandavapura, Mandya', 'Pandavapura', 'Mandya', 'Karnataka', '571434', 'India', 12.5, 76.6667, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-fwd-sugarcane-3acres', admin_id, cat_preharvest, 'Forward Contract: High-Recovery Sugarcane Co-86032 (3-Acre Stand)', '3-acre standing sugarcane ready for 12-month mill crushing in January. Expected brix 21-22%, high juice purity, estimated yield 55 Tons/acre.', 95000, 'ACRE', 3, 'Pandavapura, Mandya, Karnataka', 'ACTIVE', 'snap-prod-fwd-sugarcane-3acres', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 95000, quantity = 3, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-fwd-sugarcane-3acres', 'prod-fwd-sugarcane-3acres', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-fwd-sugarcane-3acres', 'prod-fwd-sugarcane-3acres', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

    -- Forward Contract: Coorg Shade-Grown Robusta Coffee Harvest (Jan Picking)
    INSERT INTO product_location_snapshots (
        id, address_line1, city, district, state, pincode, country, latitude, longitude, location_type, address_type, taluk_id, created_date, last_modified_date
    ) VALUES (
        'snap-prod-fwd-robusta-coffee-50bags', 'Madikeri, Kodagu', 'Madikeri', 'Kodagu', 'Karnataka', '571201', 'India', 12.4244, 75.7382, 'MANUAL', 'FARM', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET last_modified_date = CURRENT_TIMESTAMP;

    INSERT INTO products (
        id, farmer_id, category_id, name, description, price, unit, quantity, location, status, product_location_snapshot_id, created_at, updated_at
    ) VALUES (
        'prod-fwd-robusta-coffee-50bags', admin_id, cat_preharvest, 'Forward Contract: Coorg Shade-Grown Robusta Coffee Harvest (Jan Picking)', 'Forward reservation of 50 bags (50kg each) of washed parchment Robusta coffee beans grown under indigenous rainforest canopy in Kodagu.', 8500, 'BAG (50KG)', 50, 'Madikeri, Kodagu, Karnataka', 'ACTIVE', 'snap-prod-fwd-robusta-coffee-50bags', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO UPDATE SET price = 8500, quantity = 50, updated_at = CURRENT_TIMESTAMP;

    INSERT INTO product_images (
        id, product_id, image_url, is_primary, display_order, created_at, updated_at
    ) VALUES (
        'img-prod-fwd-robusta-coffee-50bags', 'prod-fwd-robusta-coffee-50bags', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO inventory (
        id, product_id, reserved_quantity, version, created_at, updated_at
    ) VALUES (
        'inv-prod-fwd-robusta-coffee-50bags', 'prod-fwd-robusta-coffee-50bags', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) ON CONFLICT (product_id) DO NOTHING;

END $$;
