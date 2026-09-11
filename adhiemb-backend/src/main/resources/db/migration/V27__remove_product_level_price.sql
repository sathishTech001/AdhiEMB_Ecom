-- Migration to remove product-level price and discount_price columns from products table
ALTER TABLE products DROP COLUMN price;
ALTER TABLE products DROP COLUMN discount_price;
