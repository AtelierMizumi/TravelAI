-- Additive PostgreSQL schema. Apply in a reviewed database transaction.
-- No legacy booking tables are modified. Monetary values are SIMULATED VND.
BEGIN;
CREATE TABLE IF NOT EXISTS auth_sessions (
    token_digest varchar(255) PRIMARY KEY, user_id bigint NOT NULL,
    issued_at timestamptz NOT NULL, last_activity_at timestamptz NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS simulated_accounts (
    id varchar(255) PRIMARY KEY, owner_id bigint NOT NULL UNIQUE,
    balance bigint NOT NULL CHECK (balance >= 0)
);
CREATE TABLE IF NOT EXISTS simulated_cards (
    id varchar(255) PRIMARY KEY, account_id varchar(255) NOT NULL,
    synthetic_id varchar(255) NOT NULL UNIQUE CHECK (synthetic_id LIKE 'SIM-MC-%'),
    cvv_hash varchar(255), expiry_month integer NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year integer NOT NULL, status varchar(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_offerings (
    id varchar(255) PRIMARY KEY, legacy_id bigint, kind varchar(255) NOT NULL,
    version varchar(255) NOT NULL, active boolean NOT NULL, definition text NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_holiday_calendars (
    id varchar(255) PRIMARY KEY, calendar_year integer NOT NULL, version varchar(255) NOT NULL,
    source text NOT NULL, approved boolean NOT NULL, approved_by bigint NOT NULL,
    approved_at timestamptz, dates text NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_reservations (
    id varchar(255) PRIMARY KEY, owner_id bigint NOT NULL, offering_id varchar(255),
    source_account_id varchar(255), status varchar(255) NOT NULL,
    original_amount bigint NOT NULL CHECK (original_amount >= 0),
    total_paid bigint NOT NULL CHECK (total_paid >= 0), revision bigint NOT NULL,
    created_at timestamptz, itinerary text NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_reviews (
    id varchar(255) PRIMARY KEY, owner_id bigint NOT NULL, reservation_id varchar(255),
    reservation_revision bigint NOT NULL, status varchar(255) NOT NULL, digest varchar(255),
    created_at timestamptz, expires_at timestamptz, quote text NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_allocations (
    id varchar(255) PRIMARY KEY, reservation_id varchar(255), review_id varchar(255),
    resource_key varchar(255) NOT NULL, quantity integer NOT NULL CHECK (quantity > 0),
    service_start timestamptz, expires_at timestamptz, status varchar(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS booking_allocation_resource ON booking_allocations(resource_key, status, expires_at);
CREATE TABLE IF NOT EXISTS simulated_transactions (
    id varchar(255) PRIMARY KEY, account_id varchar(255), reservation_id varchar(255),
    operation_id varchar(255), kind varchar(255) NOT NULL,
    amount bigint NOT NULL CHECK (amount >= 0), created_at timestamptz
);
CREATE TABLE IF NOT EXISTS booking_history (
    id varchar(255) PRIMARY KEY, reservation_id varchar(255), operation_id varchar(255),
    actor_id bigint NOT NULL, action varchar(255) NOT NULL, created_at timestamptz, details text NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_operations (
    id varchar(255) PRIMARY KEY, owner_id bigint NOT NULL, action varchar(255) NOT NULL,
    request_digest varchar(255) NOT NULL, result text NOT NULL
);
CREATE TABLE IF NOT EXISTS booking_barrier (id integer PRIMARY KEY);
INSERT INTO booking_barrier(id) VALUES (1) ON CONFLICT DO NOTHING;
COMMIT;
