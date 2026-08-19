-- Migration V23: Update CUSTOMER role code to CUST and add thread-safe Customer URN
-- 1. Update roles table
UPDATE roles SET code = 'CUST', name = 'Customer Storefront' WHERE code = 'CUSTOMER';

-- 2. Add customer_urn column to users table if not exists
ALTER TABLE users ADD COLUMN customer_urn VARCHAR(50) DEFAULT NULL;

-- 3. Add UNIQUE constraint index on customer_urn
CREATE UNIQUE INDEX idx_users_customer_urn ON users(customer_urn);

-- 4. Create customer_urn_sequence counter table for thread-safe URN generation
CREATE TABLE IF NOT EXISTS customer_urn_sequence (
    id INT NOT NULL PRIMARY KEY,
    current_value BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- 5. Seed sequence counter with maximum existing customer ID
INSERT INTO customer_urn_sequence (id, current_value)
SELECT 1, COALESCE((SELECT MAX(id) FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'CUST')), 0)
ON DUPLICATE KEY UPDATE current_value = VALUES(current_value);

-- 6. Populate existing CUST users with generated customer_urn
UPDATE users 
SET customer_urn = CONCAT('CUST-2026-', LPAD(id, 6, '0')) 
WHERE role_id = (SELECT id FROM roles WHERE code = 'CUST') AND customer_urn IS NULL;
