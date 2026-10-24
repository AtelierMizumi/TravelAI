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
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_locations_name UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations (name);
CREATE INDEX IF NOT EXISTS idx_locations_province ON locations (province);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations (category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_name_unique ON locations (LOWER(name));

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
ON CONFLICT (name) DO NOTHING;

-- 7. Create Tours Table
CREATE TABLE IF NOT EXISTS tours (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location_id BIGINT,
    province VARCHAR(100),
    duration VARCHAR(50) NOT NULL,
    departure_dates VARCHAR(255),
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    rating DOUBLE PRECISION DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    image_url VARCHAR(512),
    highlights TEXT,
    itinerary TEXT,
    available_slots INTEGER DEFAULT 20,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tours_location FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tours_location_id ON tours (location_id);
CREATE INDEX IF NOT EXISTS idx_tours_province ON tours (province);
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours (price);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours (status);

-- 8. Seed Default Tours (Linked to Locations)
INSERT INTO tours (title, description, location_id, province, duration, departure_dates, price, currency, rating, review_count, image_url, highlights, itinerary, available_slots, status)
VALUES
(
    'Tour Du Thuyền 5 Sao Khám Phá Vịnh Hạ Long & Hang Sửng Sốt 2N1Đ',
    'Trải nghiệm đẳng cấp trên vịnh di sản thế giới với du thuyền 5 sao, chèo kayak tại Hang Luồn, khám phá Hang Sửng Sốt và ngắm hoàng hôn rực rỡ.',
    (SELECT id FROM locations WHERE name = 'Vịnh Hạ Long' LIMIT 1),
    'Quảng Ninh',
    '2 ngày 1 đêm',
    'Hàng ngày',
    2450000.00,
    'VND',
    4.9,
    128,
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    'Phòng view biển ban công riêng, Buffet hải sản 5 sao, Hướng dẫn viên song ngữ, Vé tham quan trọn gói',
    'Ngày 1: Hà Nội - Tuần Châu - Vịnh Hạ Long - Hang Sửng Sốt; Ngày 2: Đảo Titop - Hang Luồn - Hà Nội',
    25,
    'ACTIVE'
),
(
    'Tour Trải Nghiệm Văn Hóa Phố Cổ Hội An & Thả Đèn Hoa Đăng 1 Ngày',
    'Dạo bước phố cổ rực rỡ đèn lồng, ghé thăm Chùa Cầu, thưởng thức cao lầu và trải nghiệm ngồi thuyền thả hoa đăng trên sông Hoài thơ mộng.',
    (SELECT id FROM locations WHERE name = 'Phố cổ Hội An' LIMIT 1),
    'Quảng Nam',
    '1 ngày',
    'Khởi hành chiều hàng ngày',
    650000.00,
    'VND',
    4.8,
    96,
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    'Vé thuyền thả đèn hoa đăng, Thưởng thức ẩm thực Hội An, Hướng dẫn viên bản địa',
    '14:00 Đón khách tại Đà Nẵng - 15:30 Tham quan Chùa Cầu & Hội quán - 18:30 Thả đèn hoa đăng - 20:30 Trở về',
    30,
    'ACTIVE'
),
(
    'Tour Trọn Gói Cầu Vàng Bà Nà Hills & Cáp Treo Đạt Kỷ Lục 1 Ngày',
    'Check-in cầu Vàng bàn tay khổng lồ, trải nghiệm làng Pháp lãng mạn, hầm rượu Debay và công viên giải trí Fantasy Park.',
    (SELECT id FROM locations WHERE name = 'Cầu Vàng - Bà Nà Hills' LIMIT 1),
    'Đà Nẵng',
    '1 ngày',
    'Hàng ngày từ 07:30',
    1150000.00,
    'VND',
    4.9,
    142,
    'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80',
    'Vé cáp treo khứ hồi, Buffet trưa hơn 100 món, Xe đưa đón đời mới tận nơi',
    '07:30 Đón khách trung tâm Đà Nẵng - 08:30 Check-in Cầu Vàng & Vườn hoa Le Jardin - 12:00 Buffet trưa - 16:30 Xuống cáp treo',
    40,
    'ACTIVE'
),
(
    'Tour Bái Đính - Tràng An - Hang Múa 1 Ngày Khởi Hành Từ Hà Nội',
    'Ngồi thuyền chèo tay khám phá Quần thể danh thắng Tràng An di sản UNESCO và leo đỉnh Ngọa Long ngắm toàn cảnh Tam Cốc.',
    (SELECT id FROM locations WHERE name = 'Quần thể danh thắng Tràng An' LIMIT 1),
    'Ninh Bình',
    '1 ngày',
    'Hàng ngày từ 07:00',
    850000.00,
    'VND',
    4.8,
    85,
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    'Vé thuyền nan Tràng An, Buffet đặc sản dê núi Ninh Bình, Hướng dẫn viên chuyên nghiệp',
    '07:00 Đón tại phố cổ Hà Nội - 09:30 Viếng chùa Bái Đính - 12:30 Ăn trưa - 13:30 Đi thuyền Tràng An - 16:00 Chinh phục Hang Múa',
    35,
    'ACTIVE'
),
(
    'City Tour Hà Nội 1 Ngày: Hồ Gươm, Lăng Bác & Văn Miếu Quốc Tử Giám',
    'Khám phá chiều sâu ngàn năm văn hiến của thủ đô qua các di tích biểu tượng: Hồ Hoàn Kiếm, Đền Ngọc Sơn, Lăng Chủ tịch và Văn Miếu.',
    (SELECT id FROM locations WHERE name = 'Hồ Hoàn Kiếm' LIMIT 1),
    'Hà Nội',
    '1 ngày',
    'Thứ 3, 5, 7 và Chủ Nhật hàng tuần',
    550000.00,
    'VND',
    4.7,
    110,
    'https://images.unsplash.com/photo-1599827552599-eeddd595b1e9?auto=format&fit=crop&w=1200&q=80',
    'Bao gồm trọn gói vé tham quan, Bữa trưa bún chả đặc sản Hà Nội, Xe máy lạnh đưa đón',
    '08:00 Đón khách - 08:30 Viếng Lăng Bác & Chùa Một Cột - 11:30 Văn Miếu - 14:30 Hồ Gươm, Đền Ngọc Sơn & Phố cổ',
    20,
    'ACTIVE'
)
ON CONFLICT DO NOTHING;

-- 9. Create Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location_id BIGINT,
    province VARCHAR(100),
    address VARCHAR(255),
    stars INTEGER DEFAULT 3,
    price_per_night NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    rating DOUBLE PRECISION DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    image_url VARCHAR(512),
    amenities TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    available_rooms INTEGER DEFAULT 10,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hotels_location FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_hotels_location_id ON hotels (location_id);
CREATE INDEX IF NOT EXISTS idx_hotels_province ON hotels (province);
CREATE INDEX IF NOT EXISTS idx_hotels_stars ON hotels (stars);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price_per_night);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels (status);

-- 10. Seed Default Hotels (Linked to Locations)
INSERT INTO hotels (name, description, location_id, province, address, stars, price_per_night, currency, rating, review_count, image_url, amenities, phone, email, available_rooms, status)
VALUES
(
    'Vinpearl Resort & Spa Hạ Long',
    'Khu nghỉ dưỡng 5 sao sang trọng hoàn toàn trên mặt biển với view 360 độ ngắm trọn vẹn Vịnh Hạ Long kỳ vĩ.',
    (SELECT id FROM locations WHERE name = 'Vịnh Hạ Long' LIMIT 1),
    'Quảng Ninh',
    'Đảo Rều, Bãi Cháy, TP. Hạ Long, Quảng Ninh',
    5,
    2200000.00,
    'VND',
    4.9,
    156,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'Hồ bơi vô cực ngoài trời, Spa Akoya cao cấp, Bãi biển riêng, Buffet sáng quốc tế, Wifi tốc độ cao',
    '02033556868',
    'resort.halong@vinpearl.com',
    20,
    'ACTIVE'
),
(
    'Anantara Hoi An Resort',
    'Khu nghỉ dưỡng thanh bình ven sông Thu Bồn, kiến trúc kết hợp duyên dáng giữa phong cách Pháp cổ và truyền thống Hội An.',
    (SELECT id FROM locations WHERE name = 'Phố cổ Hội An' LIMIT 1),
    'Quảng Nam',
    '1 Đường Phạm Hồng Thái, Cẩm Châu, Hội An, Quảng Nam',
    5,
    3150000.00,
    'VND',
    4.9,
    118,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'Hồ bơi sân vườn nhiệt đới, Du thuyền ngắm hoàng hôn sông Thu Bồn, Lớp học nấu ăn truyền thống, Xe đạp miễn phí',
    '02353914555',
    'hoian@anantara.com',
    15,
    'ACTIVE'
),
(
    'Mercure Danang French Village Bana Hills',
    'Khách sạn duy nhất tọa lạc trên đỉnh Bà Nà, mang không gian kiến trúc Gothic thế kỷ 19 lãng mạn giữa mây ngàn.',
    (SELECT id FROM locations WHERE name = 'Cầu Vàng - Bà Nà Hills' LIMIT 1),
    'Đà Nẵng',
    'Khu du lịch Bà Nà Hills, Hòa Ninh, Hòa Vang, Đà Nẵng',
    4,
    1850000.00,
    'VND',
    4.8,
    134,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'Hồ bơi nước nóng trong nhà La Piscine, Check-in Cầu Vàng sớm không đông người, Rạp chiếu phim 4D',
    '02363799888',
    'H8488-RE@accor.com',
    25,
    'ACTIVE'
),
(
    'Ninh Binh Hidden Charm Hotel & Resort',
    'Tọa lạc giữa khung cảnh thiên nhiên thơ mộng gần bến thuyền Tam Cốc - Bích Động và quần thể Tràng An.',
    (SELECT id FROM locations WHERE name = 'Quần thể danh thắng Tràng An' LIMIT 1),
    'Ninh Bình',
    'Số 9, Trung tâm du lịch Tam Cốc, Ninh Thắng, Hoa Lư, Ninh Bình',
    4,
    1250000.00,
    'VND',
    4.7,
    89,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'Hồ bơi ngoài trời nhìn ra núi đá vôi, Nhà hàng ẩm thực địa phương, Spa & Massage thư giãn, Cho thuê xe đạp',
    '02293888555',
    'info@hiddencharmresort.com',
    18,
    'ACTIVE'
),
(
    'Sofitel Legend Metropole Hanoi',
    'Khách sạn 5 sao huyền thoại giữa trung tâm thủ đô gần Hồ Gươm, gìn giữ nét tinh hoa lịch sử từ năm 1901.',
    (SELECT id FROM locations WHERE name = 'Hồ Hoàn Kiếm' LIMIT 1),
    'Hà Nội',
    '15 Phố Ngô Quyền, Hoàn Kiếm, Hà Nội',
    5,
    4600000.00,
    'VND',
    4.9,
    210,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'Hồ bơi ngoài trời Le Club, Hầm rượu lịch sử, Nhà hàng ẩm thực Pháp Le Beaulieu, Dịch vụ quản gia cao cấp',
    '02438266919',
    'h1555@sofitel.com',
    12,
    'ACTIVE'
)
ON CONFLICT DO NOTHING;

-- 11. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(32) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    booking_type VARCHAR(20) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    voucher_code VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings (booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at);

-- 12. Create Booking Details Table
CREATE TABLE IF NOT EXISTS booking_details (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    tour_id BIGINT,
    hotel_id BIGINT,
    item_name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    number_of_nights INTEGER DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL,
    CONSTRAINT fk_booking_details_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_details_tour FOREIGN KEY (tour_id) REFERENCES tours (id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_details_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_details_booking_id ON booking_details (booking_id);

-- 13. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    transaction_code VARCHAR(64) NOT NULL UNIQUE,
    payment_method VARCHAR(32) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    transaction_ref VARCHAR(128),
    payment_url VARCHAR(512),
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_code ON payments (transaction_code);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

