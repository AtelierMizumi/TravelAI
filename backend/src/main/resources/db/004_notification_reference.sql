BEGIN;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_reference varchar(255);
COMMIT;
