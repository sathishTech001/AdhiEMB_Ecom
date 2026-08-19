-- Seed Sample Reviews
INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, status, created_by, updated_by) VALUES
(1, 1, 1, 5, 'Stunning Peacock Detail!', 'The stitch density is perfect and had zero thread breaks during machine run. Highly recommended!', TRUE, 'APPROVED', 'system', 'system'),
(2, 1, 2, 4, 'Great Floral Neck Pattern', 'Stitched out nicely on velvet. A few extra color stops, but overall beautiful result.', TRUE, 'APPROVED', 'system', 'system'),
(3, 2, 1, 5, 'Excellent Border Alignment', 'Used this geometric border for a sari lace project. Flawless symmetry.', TRUE, 'APPROVED', 'system', 'system'),
(4, 4, 2, 5, 'Perfect Monogram Set', 'All letters A through Z rendered crisp and clean. Great font set for custom gifts.', TRUE, 'APPROVED', 'system', 'system');

-- Seed Sample Notifications
INSERT INTO notifications (id, user_id, title, message, type, action_link, is_read, created_by, updated_by) VALUES
(1, 1, 'Welcome to AdhiEMB', 'Thank you for joining AdhiEMB Marketplace! Explore top embroidery patterns.', 'SYSTEM', '/products', TRUE, 'system', 'system'),
(2, 1, 'Order Confirmation', 'Your order EMB-2026-1001 has been processed successfully.', 'ORDER', '/orders/EMB-2026-1001', FALSE, 'system', 'system'),
(3, 2, 'New Review Received', 'Someone left a 4-star review on your Royal Peacock Floral Neck Design.', 'REVIEW', '/products/1', FALSE, 'system', 'system'),
(4, 2, 'Order Confirmation', 'Your order EMB-2026-1002 has been processed successfully.', 'ORDER', '/orders/EMB-2026-1002', TRUE, 'system', 'system');

-- Seed System Settings
INSERT INTO system_settings (id, setting_key, setting_value, setting_group, description, created_by, updated_by) VALUES
(1, 'site_name', 'AdhiEMB Marketplace', 'GENERAL', 'The official brand name of the marketplace platform', 'system', 'system'),
(2, 'designer_commission_rate', '70', 'COMMISSION', 'Default designer revenue share percentage (70%)', 'system', 'system'),
(3, 'support_email', 'support@adhiemb.com', 'GENERAL', 'Platform customer support and inquiry email', 'system', 'system'),
(4, 'currency', 'USD', 'PAYMENT', 'Primary platform transactional currency code', 'system', 'system'),
(5, 'razorpay_key_id', 'rzp_test_AdhiEMB2026', 'PAYMENT', 'Razorpay public API key ID for payment processing', 'system', 'system'),
(6, 'stripe_publishable_key', 'pk_test_AdhiEMB2026', 'PAYMENT', 'Stripe publishable API key for frontend checkout', 'system', 'system');
