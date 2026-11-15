-- NULL identifies an older plaintext row until its content is migrated.
BEGIN;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS content_encryption varchar(32);
COMMIT;
