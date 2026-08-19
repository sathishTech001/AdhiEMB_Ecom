-- V22: Fix PaymentStatus enum mismatch in seeded orders
-- The PaymentStatus Java enum uses: INITIATED, SUCCESS, FAILED
-- V15 seed inserted 'PAID' which is not a valid enum value, causing
-- "No enum constant PaymentStatus.PAID" at runtime when reading order rows.

UPDATE orders
SET payment_status = 'SUCCESS'
WHERE payment_status = 'PAID';
