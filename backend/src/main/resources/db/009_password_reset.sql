BEGIN;
CREATE TABLE IF NOT EXISTS password_reset_requests (
    user_id bigint PRIMARY KEY,
    code_digest varchar(64) NOT NULL,
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    failed_attempts integer NOT NULL CHECK (failed_attempts >= 0),
    consumed boolean NOT NULL
);
COMMIT;
