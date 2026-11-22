-- Additive bank encryption schema. No automatic startup rewriting of existing bank rows.
-- Apply only after backing up DB and reviewing the change with the user.
BEGIN;
ALTER TABLE simulated_cards ADD COLUMN IF NOT EXISTS encrypted_synthetic_id text;
ALTER TABLE simulated_cards ADD COLUMN IF NOT EXISTS identifier_lookup varchar(64);
CREATE UNIQUE INDEX IF NOT EXISTS simulated_card_identifier_lookup ON simulated_cards(identifier_lookup);
COMMIT;
-- New cards use AES-256-GCM ciphertext and keyed three-digit-code verifiers.
-- Legacy codes stay readable via the compatibility path; data conversion is a separate reviewed plan.
-- A separate reviewed data migration is required to encrypt legacy rows and scrub old copies.
-- Preserve the original key and test restore before switching application/schema versions.
