-- Additive message retry protection for legacy PostgreSQL databases.
BEGIN;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS client_message_id varchar(255);
CREATE UNIQUE INDEX IF NOT EXISTS chat_message_client_retry ON chat_messages(client_message_id);
COMMIT;
