-- V44: Farmer-to-Buyer Bilateral Negotiation Engine & Reverse Demand Board
-- Aligns with University DBMS Project ER Diagram & Real-Life Direct Marketplace

CREATE TABLE IF NOT EXISTS negotiations (
    id VARCHAR(36) PRIMARY KEY,
    produce_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    buyer_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    farmer_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'KG',
    proposed_price NUMERIC(10, 2) NOT NULL,
    counter_price NUMERIC(10, 2),
    final_price NUMERIC(10, 2),
    status VARCHAR(30) DEFAULT 'PENDING',
    buyer_notes TEXT,
    farmer_notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buyer_demands (
    id VARCHAR(36) PRIMARY KEY,
    buyer_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    category_id VARCHAR(36),
    quantity_needed NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'KG',
    target_price_per_unit NUMERIC(10, 2) NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'GRADE_A',
    required_by_date DATE NOT NULL,
    delivery_taluk_id VARCHAR(50),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100) DEFAULT 'Karnataka',
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demand_bids (
    id VARCHAR(36) PRIMARY KEY,
    demand_id VARCHAR(36) REFERENCES buyer_demands(id) ON DELETE CASCADE,
    farmer_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    offered_quantity NUMERIC(10, 2) NOT NULL,
    offered_price_per_unit NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_negotiations_farmer ON negotiations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_produce ON negotiations(produce_id);
CREATE INDEX IF NOT EXISTS idx_buyer_demands_status ON buyer_demands(status);
CREATE INDEX IF NOT EXISTS idx_demand_bids_demand ON demand_bids(demand_id);
