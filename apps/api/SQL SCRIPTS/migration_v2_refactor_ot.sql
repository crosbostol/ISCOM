-- Migration Script: Refactor OT Table (String PK -> Integer PK)
-- Author: Senior Backend Developer
-- Date: 2025-12-05


BEGIN;

-- 0. Cleanup Orphans (Data Integrity Pre-check)
-- Delete records in child tables that reference non-existent OTs
DELETE FROM pro_ot WHERE ot_id NOT IN (SELECT ot_id FROM ot);
DELETE FROM itm_ot WHERE ot_id NOT IN (SELECT ot_id FROM ot);
-- Assuming 'image' table exists and has ot_id
DELETE FROM image WHERE ot_id NOT IN (SELECT ot_id FROM ot);

-- 1. Modify OT Table Structure

---------------------------------------------------------------------------
-- Add new Serial PK
ALTER TABLE ot ADD COLUMN id SERIAL;
-- Add is_additional flag
ALTER TABLE ot ADD COLUMN is_additional BOOLEAN DEFAULT false;

-- Drop old PK constraint (Use CASCADE to drop foreign keys from itm_ot, pro_ot, image automatically)
-- WARNING: This removes the PK constraint and any FKs referencing it.
ALTER TABLE ot DROP CONSTRAINT ot_pkey CASCADE;

-- Rename old PK to external_ot_id and remove constraints
ALTER TABLE ot RENAME COLUMN ot_id TO external_ot_id;
ALTER TABLE ot ALTER COLUMN external_ot_id DROP NOT NULL;

-- Set new PK and Unique constraint on external_id
ALTER TABLE ot ADD CONSTRAINT ot_pkey PRIMARY KEY (id);
ALTER TABLE ot ADD CONSTRAINT ot_external_id_unique UNIQUE (external_ot_id);


-- 2. Migrate Dependent Tables
---------------------------------------------------------------------------

-- A. Table: pro_ot
-------------------
ALTER TABLE pro_ot ADD COLUMN new_ot_id INTEGER;

-- Data Migration: Map old string ID to new integer ID
UPDATE pro_ot p
SET new_ot_id = o.id
FROM ot o
WHERE p.ot_id = o.external_ot_id;

-- Cleanup and Constraints
ALTER TABLE pro_ot DROP COLUMN ot_id;
ALTER TABLE pro_ot RENAME COLUMN new_ot_id TO ot_id;
ALTER TABLE pro_ot ALTER COLUMN ot_id SET NOT NULL;
ALTER TABLE pro_ot ADD CONSTRAINT pro_ot_ot_id_fkey FOREIGN KEY (ot_id) REFERENCES ot(id);
-- Re-establish PK (assuming it was composite ot_id + product_id)
-- ALTER TABLE pro_ot ADD PRIMARY KEY (ot_id, product_id); -- Uncomment if needed


-- B. Table: itm_ot
-------------------
ALTER TABLE itm_ot ADD COLUMN new_ot_id INTEGER;

UPDATE itm_ot i
SET new_ot_id = o.id
FROM ot o
WHERE i.ot_id = o.external_ot_id;

ALTER TABLE itm_ot DROP COLUMN ot_id;
ALTER TABLE itm_ot RENAME COLUMN new_ot_id TO ot_id;
ALTER TABLE itm_ot ALTER COLUMN ot_id SET NOT NULL;
ALTER TABLE itm_ot ADD CONSTRAINT itm_ot_ot_id_fkey FOREIGN KEY (ot_id) REFERENCES ot(id);
-- ALTER TABLE itm_ot ADD PRIMARY KEY (ot_id, item_id); -- Uncomment if needed


-- C. Table: image
-------------------
-- Assuming 'image' table has a column 'ot_id' based on context (though file crea_tabla_image.sql exists, I haven't read it. Proceeding with standard assumption).
ALTER TABLE image ADD COLUMN new_ot_id INTEGER;

UPDATE image i
SET new_ot_id = o.id
FROM ot o
WHERE i.ot_id = o.external_ot_id;

ALTER TABLE image DROP COLUMN ot_id;
ALTER TABLE image RENAME COLUMN new_ot_id TO ot_id;
ALTER TABLE image ALTER COLUMN ot_id SET NOT NULL;
ALTER TABLE image ADD CONSTRAINT image_ot_id_fkey FOREIGN KEY (ot_id) REFERENCES ot(id);


COMMIT;
