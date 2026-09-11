-- ==========================================================
-- V26: PRODUCT FILE DATA ARCHITECTURE & MULTI-FILE PRICING
-- ==========================================================

-- 1. Create product_file_data table
CREATE TABLE IF NOT EXISTS product_file_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    machine_info VARCHAR(150),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    file_size_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_pfd_product (product_id),
    INDEX idx_pfd_format (file_format)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Migrate existing records from product_files to product_file_data if any
INSERT INTO product_file_data (id, product_id, original_file_name, storage_key, file_format, machine_info, price, file_size_bytes, is_active, created_at, updated_at)
SELECT id, product_id, COALESCE(original_file_name, 'design_file'), file_path, file_format, 'Standard', 0.00, COALESCE(file_size_bytes, 0), TRUE, created_at, updated_at
FROM product_files
ON DUPLICATE KEY UPDATE product_id = VALUES(product_id);

-- 3. Enhance cart_items for individual product_file_data selections
ALTER TABLE cart_items 
    ADD COLUMN product_file_id BIGINT NULL AFTER product_id;

ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_pfd FOREIGN KEY (product_file_id) REFERENCES product_file_data(id) ON DELETE CASCADE;

-- 4. Enhance order_items for granular file purchases
ALTER TABLE order_items 
    ADD COLUMN product_file_id BIGINT NULL AFTER product_id,
    ADD COLUMN machine_info VARCHAR(150) NULL AFTER product_price,
    ADD COLUMN file_format VARCHAR(20) NULL AFTER machine_info;

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_pfd FOREIGN KEY (product_file_id) REFERENCES product_file_data(id) ON DELETE SET NULL;
