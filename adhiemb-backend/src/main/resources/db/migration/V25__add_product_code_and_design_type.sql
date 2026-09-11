ALTER TABLE products ADD COLUMN product_code VARCHAR(100) NULL AFTER title;
ALTER TABLE products ADD COLUMN design_type VARCHAR(100) NULL AFTER category_id;
CREATE INDEX idx_products_design_type ON products(design_type);
CREATE INDEX idx_products_product_code ON products(product_code);

-- Backfill seed data
UPDATE products SET product_code = 'EMB-FLR-001', design_type = 'Neck Design' WHERE id = 1;
UPDATE products SET product_code = 'EMB-GEO-002', design_type = 'Border' WHERE id = 2;
UPDATE products SET product_code = 'EMB-ANM-003', design_type = 'Motif' WHERE id = 3;
UPDATE products SET product_code = 'EMB-MNO-004', design_type = 'Monogram' WHERE id = 4;
UPDATE products SET product_code = 'EMB-FLR-005', design_type = 'Motif' WHERE id = 5;
UPDATE products SET product_code = 'EMB-FST-006', design_type = 'Allover' WHERE id = 6;
UPDATE products SET product_code = 'EMB-BDR-007', design_type = 'Motif' WHERE id = 7;
UPDATE products SET product_code = 'EMB-BDR-008', design_type = 'Bridal' WHERE id = 8;
