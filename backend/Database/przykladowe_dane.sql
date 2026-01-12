START TRANSACTION;

-- 1) USERS
INSERT INTO users (id_user, first_name, last_name, email, password, phone_number, create_account_date) VALUES
(1, 'Jan', 'Kowalski', 'jan.kowalski@example.com', '$2y$10$examplehash_jan', '+48500111222', '2026-01-01 10:00:00'),
(2, 'Anna', 'Nowak', 'anna.nowak@example.com', '$2y$10$examplehash_anna', '+48500333444', '2026-01-02 12:30:00'),
(3, 'Piotr', 'Zieliński', 'piotr.zielinski@example.com', '$2y$10$examplehash_piotr', '+48500555666', '2026-01-03 09:15:00');

-- 2) CATEGORIES
INSERT INTO categories (id_category, category_name) VALUES
(1, 'Elektronika'),
(2, 'Komputery'),
(3, 'Smartfony'),
(4, 'Dom i ogród'),
(5, 'Sport'),
(6, 'Kolekcje');

-- 3) AUCTIONS
-- status: 'at_auction' | 'sold' | 'not_issued'
-- id_winner może być NULL, jeśli aukcja trwa / nie ma zwycięzcy
INSERT INTO auctions
(id_auction, title, description, id_seller, start_price, start_date, end_date, overtime, status, id_winner)
VALUES
(1, 'Karta graficzna RTX 4070', 'Używana, w pełni sprawna, pudełko w komplecie.', 1, 1999.00, '2026-01-05 18:00:00', '2026-01-12 18:00:00', 0, 'at_auction', NULL),
(2, 'iPhone 13 128GB', 'Stan bardzo dobry, bateria 88%, bez blokad.', 2, 1499.00, '2026-01-03 08:00:00', '2026-01-10 20:00:00', 0, 'sold', 3),
(3, 'Zegarek kolekcjonerski', 'Mechaniczny, rocznik 1980, po przeglądzie.', 3, 800.00, '2026-01-02 09:00:00', '2026-01-08 21:00:00', 0, 'not_issued', NULL);

-- 4) CATEGORIE_AUCTION (many-to-many)
INSERT INTO categorie_auction (id_category, id_auction) VALUES
(1, 1), -- Elektronika -> RTX
(2, 1), -- Komputery -> RTX
(1, 2), -- Elektronika -> iPhone
(3, 2), -- Smartfony -> iPhone
(6, 3); -- Kolekcje -> Zegarek

-- 5) PHOTOS_ITEM
INSERT INTO photos_item (id_photo, id_auction, photo, is_main_photo) VALUES
(1, 1, 'rtx4070_main.jpg', 1),
(2, 1, 'rtx4070_backplate.jpg', 0),
(3, 2, 'iphone13_front.jpg', 1),
(4, 2, 'iphone13_box.jpg', 0),
(5, 3, 'watch_main.jpg', 1);

-- 6) AUCTION_PRICE_HISTORY (oferty/podbicia)
-- Uwaga: id_user musi wskazywać istniejącego usera, id_auction istniejącą aukcję.
INSERT INTO auction_price_history (id_price_history, id_auction, id_user, new_price, price_reprint_date) VALUES
(1, 1, 2, 2050.00, '2026-01-06 10:05:00'),
(2, 1, 3, 2100.00, '2026-01-06 10:07:30'),
(3, 1, 2, 2200.00, '2026-01-07 19:15:10'),
(4, 2, 1, 1550.00, '2026-01-04 11:00:00'),
(5, 2, 3, 1600.00, '2026-01-05 16:20:00'),
(6, 2, 3, 1650.00, '2026-01-09 18:45:00');

COMMIT;
