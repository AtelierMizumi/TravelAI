BEGIN;
ALTER TABLE simulated_cards ADD COLUMN IF NOT EXISTS bank_name varchar(255) NOT NULL DEFAULT 'Ngân hàng Mastercard SIMULATED';
-- Existing cards were already shown as available to their owner; preserve that existing linkage.
ALTER TABLE simulated_cards ADD COLUMN IF NOT EXISTS linked boolean NOT NULL DEFAULT true;
ALTER TABLE simulated_cards ALTER COLUMN linked SET DEFAULT false;
CREATE TABLE IF NOT EXISTS simulated_payment_attempts (
 id varchar(255) PRIMARY KEY,
 operation_id varchar(255) NOT NULL UNIQUE,
 owner_id bigint NOT NULL,
 review_id varchar(255) NOT NULL,
 reservation_id varchar(255),
 status varchar(255) NOT NULL CHECK (status IN ('SUCCEEDED','FAILED')),
 reason varchar(255) NOT NULL,
 amount bigint NOT NULL CHECK (amount >= 0),
 created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS simulated_payment_attempts_owner ON simulated_payment_attempts(owner_id,created_at DESC);
COMMIT;
