-- Seed Categories
INSERT INTO categories (id, name, slug, description, image_url, icon, parent_id, sort_order, is_active) VALUES
(1, 'Floral Designs', 'floral-designs', 'Beautiful embroidery designs featuring flowers, leaves, and botanicals', '/uploads/categories/floral.jpg', 'local_florist', NULL, 1, TRUE),
(2, 'Geometric Patterns', 'geometric-patterns', 'Modern and symmetry-based geometric embroidery patterns', '/uploads/categories/geometric.jpg', 'grid_on', NULL, 2, TRUE),
(3, 'Animal Motifs', 'animal-motifs', 'Stunning animal, bird, and wildlife embroidery artwork', '/uploads/categories/animals.jpg', 'pets', NULL, 3, TRUE),
(4, 'Monograms & Letters', 'monograms-letters', 'Alphabets, monograms, lettering, and calligraphy machine designs', '/uploads/categories/monograms.jpg', 'font_download', NULL, 4, TRUE),
(5, 'Border & Lace', 'border-lace', 'Decorative borders, lace, necklines, and frame embroidery patterns', '/uploads/categories/borders.jpg', 'texture', NULL, 5, TRUE),
(6, 'Festive & Cultural', 'festive-cultural', 'Traditional, wedding, festival, and ethnic embroidery collections', '/uploads/categories/festive.jpg', 'celebration', NULL, 6, TRUE);

-- Seed Sample Products
INSERT INTO products (id, title, slug, description, price, discount_price, stitch_count, width_mm, height_mm, color_count, stop_count, category_id, designer_id, status, is_featured, downloads_count, view_count, rating_average, rating_count) VALUES
(1, 'Royal Peacock Floral Neck Design', 'royal-peacock-floral-neck-design', 'Intricate royal peacock neck embroidery pattern with floral embellishments designed for dress necks.', 499.00, 349.00, 24500, 180.00, 240.00, 8, 10, 1, 1, 'APPROVED', TRUE, 45, 320, 4.80, 12),
(2, 'Geometric Mandala Border', 'geometric-mandala-border', 'Symmetrical geometric mandala border design suitable for sarees, dupattas, and curtains.', 299.00, 199.00, 15200, 250.00, 60.00, 4, 6, 2, 1, 'APPROVED', TRUE, 30, 210, 4.60, 8),
(3, 'Golden Elephant Motif', 'golden-elephant-motif', 'Traditional Indian golden elephant motif ideal for blouse backs, jackets, and wall art.', 399.00, 299.00, 18900, 120.00, 140.00, 6, 8, 3, 2, 'APPROVED', FALSE, 18, 150, 4.50, 6),
(4, 'Classic Serif Monogram A-Z', 'classic-serif-monogram-a-z', 'Complete alphabet monogram set with elegant serif font embellishment.', 599.00, 399.00, 8500, 80.00, 80.00, 3, 4, 4, 1, 'APPROVED', TRUE, 62, 410, 4.90, 20),
(5, 'Vintage Rose Patch', 'vintage-rose-patch', 'Detailed vintage rose bloom patch embroidery design for denim jackets and bags.', 199.00, NULL, 12800, 100.00, 110.00, 5, 7, 1, 2, 'APPROVED', FALSE, 22, 180, 4.70, 5),
(6, 'Traditional Paisley Pattern', 'traditional-paisley-pattern', 'Rich traditional Kalka/Paisley motif with intricate threadwork filler.', 349.00, 249.00, 16400, 130.00, 190.00, 7, 9, 6, 1, 'APPROVED', FALSE, 38, 290, 4.65, 11),
(7, 'Royal Crown Emblem', 'royal-crown-emblem', 'Luxurious royal crown emblem design with gold metallic thread accents.', 249.00, 179.00, 11000, 90.00, 85.00, 4, 5, 5, 2, 'APPROVED', FALSE, 15, 120, 4.40, 4),
(8, 'Indian Bridal Border', 'indian-bridal-border', 'Heavy bridal border design with zari and dori embroidery finish.', 799.00, 599.00, 38000, 300.00, 85.00, 10, 14, 5, 1, 'APPROVED', TRUE, 55, 520, 4.95, 18);

-- Seed Product Images
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1, '/uploads/products/peacock_neck_1.jpg', TRUE, 1),
(1, '/uploads/products/peacock_neck_2.jpg', FALSE, 2),
(2, '/uploads/products/mandala_border_1.jpg', TRUE, 1),
(3, '/uploads/products/elephant_motif_1.jpg', TRUE, 1),
(4, '/uploads/products/serif_monogram_1.jpg', TRUE, 1),
(5, '/uploads/products/vintage_rose_1.jpg', TRUE, 1),
(6, '/uploads/products/paisley_pattern_1.jpg', TRUE, 1),
(7, '/uploads/products/crown_emblem_1.jpg', TRUE, 1),
(8, '/uploads/products/bridal_border_1.jpg', TRUE, 1);

-- Seed Product Files
INSERT INTO product_files (product_id, file_path, file_format, file_size_bytes, original_file_name) VALUES
(1, 'products/files/royal_peacock_floral.dst', 'DST', 450200, 'royal_peacock_floral.dst'),
(1, 'products/files/royal_peacock_floral.pes', 'PES', 432100, 'royal_peacock_floral.pes'),
(1, 'products/files/royal_peacock_floral.emb', 'EMB', 1250000, 'royal_peacock_floral.emb'),
(2, 'products/files/geometric_mandala.dst', 'DST', 280000, 'geometric_mandala.dst'),
(2, 'products/files/geometric_mandala.jef', 'JEF', 275000, 'geometric_mandala.jef'),
(3, 'products/files/golden_elephant.dst', 'DST', 310000, 'golden_elephant.dst'),
(3, 'products/files/golden_elephant.exp', 'EXP', 305000, 'golden_elephant.exp'),
(4, 'products/files/serif_monogram_az.dst', 'DST', 180000, 'serif_monogram_az.dst'),
(4, 'products/files/serif_monogram_az.pes', 'PES', 175000, 'serif_monogram_az.pes'),
(5, 'products/files/vintage_rose.dst', 'DST', 230000, 'vintage_rose.dst'),
(6, 'products/files/traditional_paisley.dst', 'DST', 320000, 'traditional_paisley.dst'),
(7, 'products/files/royal_crown.dst', 'DST', 190000, 'royal_crown.dst'),
(8, 'products/files/indian_bridal_border.dst', 'DST', 680000, 'indian_bridal_border.dst'),
(8, 'products/files/indian_bridal_border.emb', 'EMB', 2100000, 'indian_bridal_border.emb');
