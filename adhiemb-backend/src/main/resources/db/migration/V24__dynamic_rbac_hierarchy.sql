-- Migration V24: Dynamic RBAC Hierarchy, Screens, and Data-Driven Permission Mappings

-- 1. Create screens table
CREATE TABLE IF NOT EXISTS screens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu_id BIGINT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    route VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_screens_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 2. Enhance permissions table
ALTER TABLE permissions ADD COLUMN screen_id BIGINT DEFAULT NULL;
ALTER TABLE permissions ADD COLUMN code VARCHAR(100) DEFAULT NULL;

-- 3. Add FK constraint to permissions for screen_id
ALTER TABLE permissions ADD CONSTRAINT fk_permissions_screen FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE SET NULL;

-- 4. Create role_menus join table if not exists
CREATE TABLE IF NOT EXISTS role_menus (
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, menu_id),
    CONSTRAINT fk_role_menus_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_menus_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Seed Screens
INSERT INTO screens (menu_id, name, code, route) VALUES
((SELECT id FROM menus WHERE code = 'DASHBOARD' LIMIT 1), 'Dashboard Main Screen', 'SCREEN_DASHBOARD', '/dashboard'),
((SELECT id FROM menus WHERE code = 'PRODUCTS' LIMIT 1), 'Product Management Screen', 'SCREEN_PRODUCT_MGMT', '/products'),
((SELECT id FROM menus WHERE code = 'PRODUCTS' LIMIT 1), 'Product Approval Screen', 'SCREEN_PRODUCT_APPROVAL', '/products/approval'),
((SELECT id FROM menus WHERE code = 'CATEGORIES' LIMIT 1), 'Category Management Screen', 'SCREEN_CATEGORY_MGMT', '/categories'),
((SELECT id FROM menus WHERE code = 'ORDERS' LIMIT 1), 'Order Ledger Screen', 'SCREEN_ORDER_LEDGER', '/orders'),
((SELECT id FROM menus WHERE code = 'USERS' LIMIT 1), 'User Directory Screen', 'SCREEN_USER_MGMT', '/users'),
((SELECT id FROM menus WHERE code = 'ROLES' LIMIT 1), 'Roles & RBAC Screen', 'SCREEN_ROLE_MGMT', '/roles'),
((SELECT id FROM menus WHERE code = 'ANALYTICS' LIMIT 1), 'Analytics Dashboard Screen', 'SCREEN_ANALYTICS', '/analytics'),
((SELECT id FROM menus WHERE code = 'AUDIT_LOGS' LIMIT 1), 'Audit Trail Screen', 'SCREEN_AUDIT_LOGS', '/audit-logs'),
((SELECT id FROM menus WHERE code = 'SETTINGS' LIMIT 1), 'System Settings Screen', 'SCREEN_SETTINGS', '/settings')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 6. Insert Dynamic Permissions
INSERT INTO permissions (module, action, code, description, screen_id) VALUES
('PRODUCT', 'VIEW', 'PRODUCT_VIEW', 'View embroidery product catalog and design details', (SELECT id FROM screens WHERE code = 'SCREEN_PRODUCT_MGMT' LIMIT 1)),
('PRODUCT', 'CREATE', 'PRODUCT_CREATE', 'Create new embroidery designs', (SELECT id FROM screens WHERE code = 'SCREEN_PRODUCT_MGMT' LIMIT 1)),
('PRODUCT', 'EDIT', 'PRODUCT_EDIT', 'Edit existing embroidery designs', (SELECT id FROM screens WHERE code = 'SCREEN_PRODUCT_MGMT' LIMIT 1)),
('PRODUCT', 'DELETE', 'PRODUCT_DELETE', 'Delete embroidery designs', (SELECT id FROM screens WHERE code = 'SCREEN_PRODUCT_MGMT' LIMIT 1)),
('PRODUCT', 'APPROVE', 'PRODUCT_APPROVE', 'Approve or reject designer product submissions', (SELECT id FROM screens WHERE code = 'SCREEN_PRODUCT_APPROVAL' LIMIT 1)),

('ORDER', 'VIEW', 'ORDER_VIEW', 'View customer orders and transaction ledger', (SELECT id FROM screens WHERE code = 'SCREEN_ORDER_LEDGER' LIMIT 1)),
('ORDER', 'CREATE', 'ORDER_CREATE', 'Create customer orders', (SELECT id FROM screens WHERE code = 'SCREEN_ORDER_LEDGER' LIMIT 1)),
('ORDER', 'EDIT', 'ORDER_EDIT', 'Update order statuses and billing details', (SELECT id FROM screens WHERE code = 'SCREEN_ORDER_LEDGER' LIMIT 1)),
('ORDER', 'CANCEL', 'ORDER_CANCEL', 'Cancel customer orders', (SELECT id FROM screens WHERE code = 'SCREEN_ORDER_LEDGER' LIMIT 1)),
('ORDER', 'EXPORT', 'ORDER_EXPORT', 'Export order reports', (SELECT id FROM screens WHERE code = 'SCREEN_ORDER_LEDGER' LIMIT 1)),

('USER', 'VIEW', 'USER_VIEW', 'View platform users directory', (SELECT id FROM screens WHERE code = 'SCREEN_USER_MGMT' LIMIT 1)),
('USER', 'CREATE', 'USER_CREATE', 'Create staff and customer accounts', (SELECT id FROM screens WHERE code = 'SCREEN_USER_MGMT' LIMIT 1)),
('USER', 'EDIT', 'USER_EDIT', 'Update user profiles and roles', (SELECT id FROM screens WHERE code = 'SCREEN_USER_MGMT' LIMIT 1)),
('USER', 'DELETE', 'USER_DELETE', 'Deactivate or remove users', (SELECT id FROM screens WHERE code = 'SCREEN_USER_MGMT' LIMIT 1)),

('ROLE', 'VIEW', 'ROLE_VIEW', 'View roles and RBAC configurations', (SELECT id FROM screens WHERE code = 'SCREEN_ROLE_MGMT' LIMIT 1)),
('ROLE', 'CREATE', 'ROLE_CREATE', 'Create custom roles', (SELECT id FROM screens WHERE code = 'SCREEN_ROLE_MGMT' LIMIT 1)),
('ROLE', 'EDIT', 'ROLE_EDIT', 'Edit roles and descriptions', (SELECT id FROM screens WHERE code = 'SCREEN_ROLE_MGMT' LIMIT 1)),
('ROLE', 'DELETE', 'ROLE_DELETE', 'Delete non-system custom roles', (SELECT id FROM screens WHERE code = 'SCREEN_ROLE_MGMT' LIMIT 1)),
('ROLE', 'MANAGE', 'ROLE_MANAGE', 'Assign permissions and navigation menus to roles', (SELECT id FROM screens WHERE code = 'SCREEN_ROLE_MGMT' LIMIT 1)),

('ANALYTICS', 'VIEW', 'ANALYTICS_VIEW', 'View business analytics and revenue charts', (SELECT id FROM screens WHERE code = 'SCREEN_ANALYTICS' LIMIT 1)),
('REPORT', 'VIEW', 'REPORT_VIEW', 'View financial and payout reports', (SELECT id FROM screens WHERE code = 'SCREEN_ANALYTICS' LIMIT 1)),
('AUDIT', 'VIEW', 'AUDIT_VIEW', 'View immutable security audit logs', (SELECT id FROM screens WHERE code = 'SCREEN_AUDIT_LOGS' LIMIT 1))
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 7. Seed Role Menus
-- OWNER gets all menus
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT r.id, m.id FROM roles r, menus m WHERE r.code = 'OWNER';

-- ADMIN gets all menus
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT r.id, m.id FROM roles r, menus m WHERE r.code = 'ADMIN';

-- EMPLOYEE gets operational menus (Dashboard, Products, Categories, Orders)
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT r.id, m.id FROM roles r, menus m WHERE r.code = 'EMPLOYEE' AND m.code IN ('DASHBOARD', 'PRODUCTS', 'CATEGORIES', 'ORDERS', 'COUPONS');

-- DESIGNER gets Products menu
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT r.id, m.id FROM roles r, menus m WHERE r.code = 'DESIGNER' AND m.code IN ('PRODUCTS', 'COUPONS');

-- 8. Seed Role Permissions
-- OWNER gets all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'OWNER';

-- ADMIN gets operational and manager permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'ADMIN';

-- DESIGNER gets product view/create/edit permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'DESIGNER' AND p.module = 'PRODUCT' AND p.action IN ('VIEW', 'CREATE', 'EDIT');
