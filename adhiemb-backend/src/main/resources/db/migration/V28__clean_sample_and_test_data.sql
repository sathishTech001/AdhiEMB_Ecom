-- ==============================================================================
-- Migration V28: Clean Sample & Test Data; Preserve Genuine Users & RBAC
-- ==============================================================================
-- 1. Identify protected users:
--    - owner@adhiemb.com
--    - admin@adhiemb.com
--    - sathishgnr26@gmail.com
--    - sathishgnr66@gmail.com
--    - adhithiya@gmail.com
--
-- 2. Remove test/sample commerce data:
--    - orders, order_items, payments, download_tokens
--    - carts, cart_items, wishlists, reviews, notifications, audit_logs
--
-- 3. Remove sample products & files:
--    - product_file_data, product_files, product_images, products
--
-- 4. Remove test/QA users:
--    - ONLY users not in preservation whitelist
--
-- 5. Preserve:
--    - roles, permissions, role_permissions
--    - menus, role_menus, screens
--    - genuine users
--    - employees
--    - system_settings
--    - customer_urn_sequence
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 2. Remove test/sample commerce & engagement data
-- ------------------------------------------------------------------------------
DELETE FROM download_tokens;
DELETE FROM order_items;
DELETE FROM payments;
DELETE FROM orders;

DELETE FROM cart_items;
DELETE FROM carts;

DELETE FROM wishlists;
DELETE FROM reviews;
DELETE FROM notifications;
DELETE FROM audit_logs;

-- ------------------------------------------------------------------------------
-- 3. Remove sample products & associated files
-- ------------------------------------------------------------------------------
DELETE FROM product_file_data;
DELETE FROM product_files;
DELETE FROM product_images;
DELETE FROM products;

-- ------------------------------------------------------------------------------
-- 4. Remove test/QA users (preserving ONLY the 5 specified genuine users)
-- ------------------------------------------------------------------------------
DELETE FROM employees 
WHERE user_id NOT IN (
    SELECT id FROM (
        SELECT id FROM users 
        WHERE email IN (
            'owner@adhiemb.com',
            'admin@adhiemb.com',
            'sathishgnr26@gmail.com',
            'sathishgnr66@gmail.com',
            'adhithiya@gmail.com'
        )
    ) AS preserved_users
);

DELETE FROM users 
WHERE email NOT IN (
    'owner@adhiemb.com',
    'admin@adhiemb.com',
    'sathishgnr26@gmail.com',
    'sathishgnr66@gmail.com',
    'adhithiya@gmail.com'
);

SET FOREIGN_KEY_CHECKS = 1;
