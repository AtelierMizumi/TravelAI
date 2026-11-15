BEGIN;
ALTER TABLE users ALTER COLUMN avatar TYPE text;
ALTER TABLE comments ALTER COLUMN user_avatar TYPE text;
ALTER TABLE chat_messages ALTER COLUMN sender_avatar TYPE text;
COMMIT;
