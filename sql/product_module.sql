-- ============================================================
-- Módulo de Productos e Inventario (FAPARCA)
-- Crea las tablas de categorías y unidades, y (re)crea la tabla
-- product con claves foráneas hacia ambas.
--
-- NOTA: el paso 4 hace DROP TABLE IF EXISTS product. Solo es seguro
-- porque la tabla product todavía no tenía datos reales (se creó
-- con el ENUM/columna de texto anteriores). Si ya cargaste productos
-- reales, exporta esa data antes de correr este script.
-- ============================================================

-- 1. Categorías de producto (líneas del molino)
CREATE TABLE IF NOT EXISTS product_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(50) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO product_category (name, code, color, sort_order, createdAt, updatedAt)
SELECT * FROM (SELECT
    'Trigo Blando' AS name, 'soft_wheat' AS code, 'var(--fap-yellow-light)' AS color, 1 AS sort_order, NOW() AS createdAt, NOW() AS updatedAt
  UNION ALL SELECT 'Trigo Durum',  'durum_wheat', 'var(--fap-red-light)',    2, NOW(), NOW()
  UNION ALL SELECT 'Harina',       'flour',       'var(--fap-green-light)', 3, NOW(), NOW()
  UNION ALL SELECT 'Afrecho',      'bran',        'var(--fap-blue-light)',  4, NOW(), NOW()
  UNION ALL SELECT 'Otro',         'other',       'var(--fap-text-muted)', 5, NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM product_category WHERE product_category.code = seed.code);

-- 2. Unidades de producto
CREATE TABLE IF NOT EXISTS product_unit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO product_unit (name, abbreviation, sort_order, createdAt, updatedAt)
SELECT * FROM (SELECT
    'Tonelada'  AS name, 'ton'    AS abbreviation, 1 AS sort_order, NOW() AS createdAt, NOW() AS updatedAt
  UNION ALL SELECT 'Kilogramo', 'kg',     2, NOW(), NOW()
  UNION ALL SELECT 'Saco',      'saco',   3, NOW(), NOW()
  UNION ALL SELECT 'Bulto',     'bulto',  4, NOW(), NOW()
  UNION ALL SELECT 'Litro',     'lt',     5, NOW(), NOW()
  UNION ALL SELECT 'Unidad',    'unidad', 6, NOW(), NOW()
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM product_unit WHERE product_unit.abbreviation = seed.abbreviation);

-- 3. Tabla product (se recrea con category_id / unit_id en vez de ENUM/VARCHAR)
DROP TABLE IF EXISTS product;

CREATE TABLE product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NULL UNIQUE,
  category_id INT NULL,
  unit_id INT NULL,
  description TEXT NULL,
  stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10,2) NULL,
  price DECIMAL(10,2) NULL,
  image VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_category(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_product_unit FOREIGN KEY (unit_id) REFERENCES product_unit(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Datos de ejemplo (los mismos que el fallback demo del frontend)
INSERT INTO product (name, code, category_id, unit_id, stock, min_stock, price, createdAt, updatedAt) VALUES
('Harina Blanca 1kg', 'HAR-001', (SELECT id FROM product_category WHERE code = 'flour'),       (SELECT id FROM product_unit WHERE abbreviation = 'saco'), 120, 30,  4.50,  NOW(), NOW()),
('Afrecho a Granel',  'AFR-001', (SELECT id FROM product_category WHERE code = 'bran'),        (SELECT id FROM product_unit WHERE abbreviation = 'ton'),   8,   10,  180.00, NOW(), NOW()),
('Trigo Blando',      'TB-001',  (SELECT id FROM product_category WHERE code = 'soft_wheat'),  (SELECT id FROM product_unit WHERE abbreviation = 'ton'),   340, 100, NULL,   NOW(), NOW()),
('Trigo Durum',       'TD-001',  (SELECT id FROM product_category WHERE code = 'durum_wheat'), (SELECT id FROM product_unit WHERE abbreviation = 'ton'),   210, 100, NULL,   NOW(), NOW());
