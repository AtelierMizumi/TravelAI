-- Place photos picked in the admin screen are stored as data URLs, like tours.image and hotels.image (text).
-- Apply by hand once on an existing database (hibernate ddl-auto=update never widens a column); the deploy agent
-- already dumps the database before every release, take an extra pg_dump first if applying between releases.
BEGIN;
ALTER TABLE places ALTER COLUMN image_url TYPE text;
COMMIT;
