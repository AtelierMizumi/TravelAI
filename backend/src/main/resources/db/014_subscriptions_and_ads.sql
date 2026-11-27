-- Additive schema for Traveler Subscription Plans (B2C) and Sponsored Ad Campaigns (B2B).
-- All monetary amounts are SIMULATED VND integers reconciled against simulated_bank_accounts.

CREATE TABLE IF NOT EXISTS subscription_plans (
    code VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    price_vnd BIGINT NOT NULL CHECK (price_vnd >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days >= 1),
    discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 50),
    waive_first_reschedule_fee BOOLEAN NOT NULL DEFAULT FALSE,
    unlimited_ai BOOLEAN NOT NULL DEFAULT TRUE,
    badge VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_code VARCHAR(40) NOT NULL,
    plan_name VARCHAR(120) NOT NULL,
    discount_percent INTEGER NOT NULL,
    waive_first_reschedule_fee BOOLEAN NOT NULL DEFAULT FALSE,
    unlimited_ai BOOLEAN NOT NULL DEFAULT TRUE,
    badge VARCHAR(60) NOT NULL,
    status VARCHAR(32) NOT NULL,
    paid_amount BIGINT NOT NULL,
    source_account_id VARCHAR(64),
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_lookup ON user_subscriptions (user_id, status, expires_at);

CREATE TABLE IF NOT EXISTS ad_packages (
    code VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    price_vnd BIGINT NOT NULL CHECK (price_vnd >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days >= 1),
    placement VARCHAR(40) NOT NULL,
    description TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    package_code VARCHAR(40) NOT NULL,
    package_name VARCHAR(120) NOT NULL,
    placement VARCHAR(40) NOT NULL,
    target_kind VARCHAR(16) NOT NULL,
    target_id BIGINT NOT NULL,
    headline VARCHAR(160) NOT NULL,
    duration_days INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL,
    paid_amount BIGINT NOT NULL,
    source_account_id VARCHAR(64),
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    admin_note VARCHAR(500),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active ON ad_campaigns (status, placement, ends_at);

CREATE TABLE IF NOT EXISTS ai_daily_usage (
    id VARCHAR(80) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    usage_date DATE NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0
);
