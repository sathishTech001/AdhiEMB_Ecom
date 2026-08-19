-- Seed Sample Orders
INSERT INTO orders (id, order_number, user_id, subtotal, discount_amount, tax_amount, total_amount, status, payment_status, payment_method, billing_name, billing_email, billing_phone, billing_address, created_by, updated_by) VALUES
(1, 'EMB-2026-1001', 1, 29.99, 0.00, 0.00, 29.99, 'PAID', 'PAID', 'MOCK_TEST', 'System Owner', 'owner@adhiemb.com', '+1234567890', '123 Tech Park, Suite 100, Silicon Valley', 'system', 'system'),
(2, 'EMB-2026-1002', 2, 29.99, 0.00, 0.00, 29.99, 'PAID', 'PAID', 'STRIPE', 'System Admin', 'admin@adhiemb.com', '+1987654321', '456 Admin Square, Suite 200, Tech City', 'system', 'system');

-- Seed Sample Order Items
INSERT INTO order_items (id, order_id, product_id, product_title, product_price, created_by, updated_by) VALUES
(1, 1, 1, 'Royal Peacock Floral Neck Design', 29.99, 'system', 'system'),
(2, 2, 2, 'Geometric Mandala Border', 29.99, 'system', 'system');

-- Seed Sample Payments
INSERT INTO payments (id, order_id, payment_number, payment_method, amount, currency, gateway_order_id, gateway_payment_id, gateway_signature, status, response_payload, created_by, updated_by) VALUES
(1, 1, 'PAY-2026-1001', 'MOCK_TEST', 29.99, 'USD', 'gtw_ord_1001', 'gtw_pay_1001', 'sig_1001', 'SUCCESS', '{"status":"SUCCESS","gateway":"MOCK"}', 'system', 'system'),
(2, 2, 'PAY-2026-1002', 'STRIPE', 29.99, 'USD', 'gtw_ord_1002', 'gtw_pay_1002', 'sig_1002', 'SUCCESS', '{"status":"SUCCESS","gateway":"STRIPE"}', 'system', 'system');

-- Seed Sample Download Tokens
INSERT INTO download_tokens (id, token, user_id, order_id, product_id, file_id, download_count, max_downloads, expires_at, created_by, updated_by) VALUES
(1, 'tok_seed_1001_peacock_dst', 1, 1, 1, 1, 2, 50, '2027-01-01 00:00:00', 'system', 'system'),
(2, 'tok_seed_1002_mandala_dst', 2, 2, 2, 4, 1, 50, '2027-01-01 00:00:00', 'system', 'system');
