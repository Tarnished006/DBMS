-- Normalize deliveries schema to support live status, carrier tracking, and telemetry updates
ALTER TABLE deliveries
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS actual_delivery_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
