-- ==============================================================================
-- TravelAI Core Backend Database Initialization Script
-- Dialect: PostgreSQL 16
-- Scope: Enterprise Authentication, RBAC and Location Management
-- ==============================================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(512),
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
);

-- Indexes for frequent lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- 3. Create Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    token VARCHAR(128) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_refresh_tokens_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);

-- 4. Create Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    province VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(512),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    category VARCHAR(100),
    rating DOUBLE PRECISION DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations (name);
CREATE INDEX IF NOT EXISTS idx_locations_province ON locations (province);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations (category);

-- 5. Seed Standard Roles
INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;

-- 6. Seed Default Locations (Vietnam Landmarks)
INSERT INTO locations (name, province, description, image_url, latitude, longitude, category, rating, review_count)
VALUES 
('Vịnh Hạ Long', 'Quảng Ninh', 'Di sản thiên nhiên thế giới UNESCO với hàng ngàn đảo đá vôi kỳ vĩ và hang động tráng lệ.', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80', 20.9101, 107.1839, 'Di sản thiên nhiên', 4.9, 128),
('Phố cổ Hội An', 'Quảng Nam', 'Đô thị cổ được bảo tồn nguyên vẹn với kiến trúc đèn lồng truyền thống và văn hóa giao thương thế kỷ 16-17.', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80', 15.8801, 108.3380, 'Di sản văn hóa', 4.8, 96),
('Cầu Vàng - Bà Nà Hills', 'Đà Nẵng', 'Biểu tượng du lịch quốc tế với đôi bàn tay khổng lồ nâng đỡ dải lụa vàng giữa mây trời đỉnh Bà Nà.', 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80', 15.9950, 107.9967, 'Kiến trúc & Giải trí', 4.9, 142),
('Quần thể danh thắng Tràng An', 'Ninh Bình', 'Di sản hỗn hợp văn hóa và thiên nhiên thế giới nổi tiếng với hệ thống hang động xuyên thủy và thung lũng đá vôi ngập nước.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', 20.2506, 105.9149, 'Di sản thiên nhiên', 4.8, 85),
('Hồ Hoàn Kiếm', 'Hà Nội', 'Trái tim thủ đô ngàn năm văn hiến, gắn liền với truyền thuyết rùa thần trả gươm và tháp Rùa cổ kính.', 'https://images.unsplash.com/photo-1599827552599-eeddd595b1e9?auto=format&fit=crop&w=1200&q=80', 21.0285, 105.8542, 'Di tích lịch sử', 4.7, 110),
('Chợ Bến Thành', 'Hồ Chí Minh', 'Biểu tượng thương mại lịch sử trung tâm Sài Gòn, nơi hội tụ tinh hoa ẩm thực và mua sắm truyền thống.', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80', 10.7725, 106.6980, 'Văn hóa - Thương mại', 4.6, 74)
ON CONFLICT DO NOTHING;
