-- Insert Roles
INSERT INTO roles (name, code, description) VALUES
('Owner', 'OWNER', 'System Owner with full access'),
('Admin', 'ADMIN', 'Administrator with full access'),
('Officer', 'OFFICER', 'Staff member with limited access'),
('Designer', 'DESIGNER', 'Embroidery Designer'),
('Customer', 'CUSTOMER', 'Regular Customer');

-- Insert Permissions
INSERT INTO permissions (module, action, description) VALUES
('DASHBOARD', 'VIEW', 'View Dashboard'),
('USER', 'VIEW', 'View Users'),
('USER', 'CREATE', 'Create Users'),
('USER', 'UPDATE', 'Update Users'),
('USER', 'DELETE', 'Delete Users'),
('USER', 'MANAGE', 'Manage Users Status'),
('EMPLOYEE', 'VIEW', 'View Employees'),
('EMPLOYEE', 'CREATE', 'Create Employees'),
('EMPLOYEE', 'UPDATE', 'Update Employees'),
('EMPLOYEE', 'DELETE', 'Delete Employees'),
('ROLE', 'VIEW', 'View Roles'),
('ROLE', 'CREATE', 'Create Roles'),
('ROLE', 'UPDATE', 'Update Roles'),
('ROLE', 'DELETE', 'Delete Roles'),
('ROLE', 'MANAGE', 'Manage Role Assignments'),
('PERMISSION', 'VIEW', 'View Permissions'),
('PERMISSION', 'CREATE', 'Create Permissions'),
('PERMISSION', 'UPDATE', 'Update Permissions'),
('MENU', 'VIEW', 'View Menus'),
('MENU', 'CREATE', 'Create Menus'),
('MENU', 'UPDATE', 'Update Menus'),
('MENU', 'DELETE', 'Delete Menus'),
('CATEGORY', 'VIEW', 'View Categories'),
('CATEGORY', 'CREATE', 'Create Categories'),
('CATEGORY', 'UPDATE', 'Update Categories'),
('CATEGORY', 'DELETE', 'Delete Categories'),
('PRODUCT', 'VIEW', 'View Products'),
('PRODUCT', 'CREATE', 'Create Products'),
('PRODUCT', 'UPDATE', 'Update Products'),
('PRODUCT', 'DELETE', 'Delete Products'),
('PRODUCT', 'APPROVE', 'Approve Products'),
('PRODUCT', 'UPLOAD', 'Upload Product Files'),
('ORDER', 'VIEW', 'View Orders'),
('ORDER', 'CREATE', 'Create Orders'),
('ORDER', 'UPDATE', 'Update Orders'),
('ORDER', 'MANAGE', 'Manage Orders'),
('PAYMENT', 'VIEW', 'View Payments'),
('PAYMENT', 'MANAGE', 'Manage Payments'),
('DOWNLOAD', 'VIEW', 'View Downloads'),
('DOWNLOAD', 'MANAGE', 'Manage Downloads'),
('REPORT', 'VIEW', 'View Reports'),
('REPORT', 'EXPORT', 'Export Reports'),
('AUDIT_LOG', 'VIEW', 'View Audit Logs'),
('NOTIFICATION', 'VIEW', 'View Notifications'),
('NOTIFICATION', 'MANAGE', 'Manage Notifications'),
('SETTING', 'VIEW', 'View Settings'),
('SETTING', 'UPDATE', 'Update Settings');

-- Assign ALL permissions to OWNER and ADMIN roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code IN ('OWNER', 'ADMIN');

-- Assign limited permissions to OFFICER (VIEW permissions + PRODUCT_APPROVE)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'OFFICER' AND (p.action = 'VIEW' OR (p.module = 'PRODUCT' AND p.action = 'APPROVE'));

-- Assign DESIGNER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'DESIGNER' AND ((p.module = 'DASHBOARD' AND p.action = 'VIEW') OR (p.module = 'PRODUCT' AND p.action IN ('VIEW', 'CREATE', 'UPDATE', 'UPLOAD')));

-- Assign CUSTOMER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'CUSTOMER' AND (p.module = 'DASHBOARD' AND p.action = 'VIEW');

-- Insert Menus
INSERT INTO menus (id, name, code, icon, path, parent_id, sort_order) VALUES
(1, 'Dashboard', 'MENU_DASHBOARD', 'dashboard', '/dashboard', NULL, 1),
(2, 'User Management', 'MENU_USER_MGT', 'group', NULL, NULL, 2),
(3, 'Access Control', 'MENU_ACCESS_CTRL', 'security', NULL, NULL, 3),
(4, 'Catalog', 'MENU_CATALOG', 'category', NULL, NULL, 4),
(5, 'Commerce', 'MENU_COMMERCE', 'shopping_cart', NULL, NULL, 5),
(6, 'Analytics', 'MENU_ANALYTICS', 'analytics', NULL, NULL, 6),
(7, 'System', 'MENU_SYSTEM', 'settings', NULL, NULL, 7);

-- Insert child menus
INSERT INTO menus (name, code, icon, path, parent_id, sort_order) VALUES
('Users', 'MENU_USERS', 'person', '/users', 2, 1),
('Employees', 'MENU_EMPLOYEES', 'badge', '/employees', 2, 2),
('Roles', 'MENU_ROLES', 'admin_panel_settings', '/roles', 3, 1),
('Permissions', 'MENU_PERMISSIONS', 'key', '/permissions', 3, 2),
('Menus', 'MENU_MENUS', 'menu', '/menus', 3, 3),
('Categories', 'MENU_CATEGORIES', 'label', '/categories', 4, 1),
('Products', 'MENU_PRODUCTS', 'inventory', '/products', 4, 2),
('Orders', 'MENU_ORDERS', 'receipt', '/orders', 5, 1),
('Payments', 'MENU_PAYMENTS', 'payment', '/payments', 5, 2),
('Downloads', 'MENU_DOWNLOADS', 'download', '/downloads', 5, 3),
('Reports', 'MENU_REPORTS', 'bar_chart', '/reports', 6, 1),
('Audit Logs', 'MENU_AUDIT_LOGS', 'history', '/audit-logs', 6, 2),
('Notifications', 'MENU_NOTIFICATIONS', 'notifications', '/notifications', 7, 1),
('Settings', 'MENU_SETTINGS', 'settings_applications', '/settings', 7, 2);

-- Assign ALL menus to OWNER and ADMIN
INSERT INTO role_menus (role_id, menu_id)
SELECT r.id, m.id FROM roles r, menus m WHERE r.code IN ('OWNER', 'ADMIN');

-- 2 default users
INSERT INTO users (email, username, password, first_name, last_name, role_id, status)
VALUES
('owner@adhiemb.com', 'owner', '$2a$12$LJ3m4ys3XNJQmhEXqYAOAOkqlHlBTGqx3NLYKQ8Md.AL1S.6HESSK', 'System', 'Owner', (SELECT id FROM roles WHERE code = 'OWNER'), 'ACTIVE'),
('admin@adhiemb.com', 'admin', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Admin', (SELECT id FROM roles WHERE code = 'ADMIN'), 'ACTIVE');

-- Add FK constraint
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;
