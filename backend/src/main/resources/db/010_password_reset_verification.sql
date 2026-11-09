BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE password_reset_requests ADD COLUMN IF NOT EXISTS ticket_digest varchar(64);
ALTER TABLE password_reset_requests ADD COLUMN IF NOT EXISTS ticket_expires_at timestamptz;
COMMIT;
