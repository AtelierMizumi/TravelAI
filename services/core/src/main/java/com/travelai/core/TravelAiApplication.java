package com.travelai.core;

import com.travelai.core.model.entity.Hotel;
import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.repository.HotelRepository;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.RoleRepository;
import com.travelai.core.repository.TourRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication
public class TravelAiApplication {

    private static final Logger log = LoggerFactory.getLogger(TravelAiApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(TravelAiApplication.class, args);
    }

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            for (RoleName roleName : RoleName.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(Role.builder().name(roleName).build());
                    log.info("Initialized system role: {}", roleName);
                }
            }
        };
    }

    @Bean
    public CommandLineRunner initLocations(LocationRepository locationRepository) {
        return args -> {
            if (locationRepository.count() == 0) {
                locationRepository.save(Location.builder()
                        .name("Vịnh Hạ Long")
                        .province("Quảng Ninh")
                        .description("Di sản thiên nhiên thế giới UNESCO với hàng ngàn đảo đá vôi kỳ vĩ và hang động tráng lệ.")
                        .imageUrl("https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80")
                        .latitude(20.9101)
                        .longitude(107.1839)
                        .category("Di sản thiên nhiên")
                        .rating(4.9)
                        .reviewCount(128)
                        .build());

                locationRepository.save(Location.builder()
                        .name("Phố cổ Hội An")
                        .province("Quảng Nam")
                        .description("Đô thị cổ được bảo tồn nguyên vẹn với kiến trúc đèn lồng truyền thống và văn hóa giao thương thế kỷ 16-17.")
                        .imageUrl("https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80")
                        .latitude(15.8801)
                        .longitude(108.3380)
                        .category("Di sản văn hóa")
                        .rating(4.8)
                        .reviewCount(96)
                        .build());

                locationRepository.save(Location.builder()
                        .name("Cầu Vàng - Bà Nà Hills")
                        .province("Đà Nẵng")
                        .description("Biểu tượng du lịch quốc tế với đôi bàn tay khổng lồ nâng đỡ dải lụa vàng giữa mây trời đỉnh Bà Nà.")
                        .imageUrl("https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80")
                        .latitude(15.9950)
                        .longitude(107.9967)
                        .category("Kiến trúc & Giải trí")
                        .rating(4.9)
                        .reviewCount(142)
                        .build());

                locationRepository.save(Location.builder()
                        .name("Quần thể danh thắng Tràng An")
                        .province("Ninh Bình")
                        .description("Di sản hỗn hợp văn hóa và thiên nhiên thế giới nổi tiếng với hệ thống hang động xuyên thủy và thung lũng đá vôi ngập nước.")
                        .imageUrl("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80")
                        .latitude(20.2506)
                        .longitude(105.9149)
                        .category("Di sản thiên nhiên")
                        .rating(4.8)
                        .reviewCount(85)
                        .build());

                locationRepository.save(Location.builder()
                        .name("Hồ Hoàn Kiếm")
                        .province("Hà Nội")
                        .description("Trái tim thủ đô ngàn năm văn hiến, gắn liền với truyền thuyết rùa thần trả gươm và tháp Rùa cổ kính.")
                        .imageUrl("https://images.unsplash.com/photo-1599827552599-eeddd595b1e9?auto=format&fit=crop&w=1200&q=80")
                        .latitude(21.0285)
                        .longitude(105.8542)
                        .category("Di tích lịch sử")
                        .rating(4.7)
                        .reviewCount(110)
                        .build());

                locationRepository.save(Location.builder()
                        .name("Chợ Bến Thành")
                        .province("Hồ Chí Minh")
                        .description("Biểu tượng thương mại lịch sử trung tâm Sài Gòn, nơi hội tụ tinh hoa ẩm thực và mua sắm truyền thống.")
                        .imageUrl("https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80")
                        .latitude(10.7725)
                        .longitude(106.6980)
                        .category("Văn hóa - Thương mại")
                        .rating(4.6)
                        .reviewCount(74)
                        .build());

                log.info("Initialized default Vietnam location dataset (6 major landmarks)");
            }
        };
    }

    @Bean
    public CommandLineRunner initTours(TourRepository tourRepository, LocationRepository locationRepository) {
        return args -> {
            if (tourRepository.count() == 0) {
                locationRepository.findByNameIgnoreCase("Vịnh Hạ Long").ifPresent(loc ->
                    tourRepository.save(Tour.builder()
                            .title("Tour Du Thuyền 5 Sao Khám Phá Vịnh Hạ Long & Hang Sửng Sốt 2N1Đ")
                            .description("Trải nghiệm đẳng cấp trên vịnh di sản thế giới với du thuyền 5 sao, chèo kayak tại Hang Luồn, khám phá Hang Sửng Sốt và ngắm hoàng hôn rực rỡ.")
                            .location(loc)
                            .province(loc.getProvince())
                            .duration("2 ngày 1 đêm")
                            .departureDates("Hàng ngày")
                            .price(new BigDecimal("2450000.00"))
                            .currency("VND")
                            .rating(4.9)
                            .reviewCount(128)
                            .imageUrl("https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80")
                            .highlights("Phòng view biển ban công riêng, Buffet hải sản 5 sao, Hướng dẫn viên song ngữ, Vé tham quan trọn gói")
                            .itinerary("Ngày 1: Hà Nội - Tuần Châu - Vịnh Hạ Long - Hang Sửng Sốt; Ngày 2: Đảo Titop - Hang Luồn - Hà Nội")
                            .availableSlots(25)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Phố cổ Hội An").ifPresent(loc ->
                    tourRepository.save(Tour.builder()
                            .title("Tour Trải Nghiệm Văn Hóa Phố Cổ Hội An & Thả Đèn Hoa Đăng 1 Ngày")
                            .description("Dạo bước phố cổ rực rỡ đèn lồng, ghé thăm Chùa Cầu, thưởng thức cao lầu và trải nghiệm ngồi thuyền thả hoa đăng trên sông Hoài thơ mộng.")
                            .location(loc)
                            .province(loc.getProvince())
                            .duration("1 ngày")
                            .departureDates("Khởi hành chiều hàng ngày")
                            .price(new BigDecimal("650000.00"))
                            .currency("VND")
                            .rating(4.8)
                            .reviewCount(96)
                            .imageUrl("https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80")
                            .highlights("Vé thuyền thả đèn hoa đăng, Thưởng thức ẩm thực Hội An, Hướng dẫn viên bản địa")
                            .itinerary("14:00 Đón khách tại Đà Nẵng - 15:30 Tham quan Chùa Cầu & Hội quán - 18:30 Thả đèn hoa đăng - 20:30 Trở về")
                            .availableSlots(30)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Cầu Vàng - Bà Nà Hills").ifPresent(loc ->
                    tourRepository.save(Tour.builder()
                            .title("Tour Trọn Gói Cầu Vàng Bà Nà Hills & Cáp Treo Đạt Kỷ Lục 1 Ngày")
                            .description("Check-in cầu Vàng bàn tay khổng lồ, trải nghiệm làng Pháp lãng mạn, hầm rượu Debay và công viên giải trí Fantasy Park.")
                            .location(loc)
                            .province(loc.getProvince())
                            .duration("1 ngày")
                            .departureDates("Hàng ngày từ 07:30")
                            .price(new BigDecimal("1150000.00"))
                            .currency("VND")
                            .rating(4.9)
                            .reviewCount(142)
                            .imageUrl("https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80")
                            .highlights("Vé cáp treo khứ hồi, Buffet trưa hơn 100 món, Xe đưa đón đời mới tận nơi")
                            .itinerary("07:30 Đón khách trung tâm Đà Nẵng - 08:30 Check-in Cầu Vàng & Vườn hoa Le Jardin - 12:00 Buffet trưa - 16:30 Xuống cáp treo")
                            .availableSlots(40)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Quần thể danh thắng Tràng An").ifPresent(loc ->
                    tourRepository.save(Tour.builder()
                            .title("Tour Bái Đính - Tràng An - Hang Múa 1 Ngày Khởi Hành Từ Hà Nội")
                            .description("Ngồi thuyền chèo tay khám phá Quần thể danh thắng Tràng An di sản UNESCO và leo đỉnh Ngọa Long ngắm toàn cảnh Tam Cốc.")
                            .location(loc)
                            .province(loc.getProvince())
                            .duration("1 ngày")
                            .departureDates("Hàng ngày từ 07:00")
                            .price(new BigDecimal("850000.00"))
                            .currency("VND")
                            .rating(4.8)
                            .reviewCount(85)
                            .imageUrl("https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80")
                            .highlights("Vé thuyền nan Tràng An, Buffet đặc sản dê núi Ninh Bình, Hướng dẫn viên chuyên nghiệp")
                            .itinerary("07:00 Đón tại phố cổ Hà Nội - 09:30 Viếng chùa Bái Đính - 12:30 Ăn trưa - 13:30 Đi thuyền Tràng An - 16:00 Chinh phục Hang Múa")
                            .availableSlots(35)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Hồ Hoàn Kiếm").ifPresent(loc ->
                    tourRepository.save(Tour.builder()
                            .title("City Tour Hà Nội 1 Ngày: Hồ Gươm, Lăng Bác & Văn Miếu Quốc Tử Giám")
                            .description("Khám phá chiều sâu ngàn năm văn hiến của thủ đô qua các di tích biểu tượng: Hồ Hoàn Kiếm, Đền Ngọc Sơn, Lăng Chủ tịch và Văn Miếu.")
                            .location(loc)
                            .province(loc.getProvince())
                            .duration("1 ngày")
                            .departureDates("Thứ 3, 5, 7 và Chủ Nhật hàng tuần")
                            .price(new BigDecimal("550000.00"))
                            .currency("VND")
                            .rating(4.7)
                            .reviewCount(110)
                            .imageUrl("https://images.unsplash.com/photo-1599827552599-eeddd595b1e9?auto=format&fit=crop&w=1200&q=80")
                            .highlights("Bao gồm trọn gói vé tham quan, Bữa trưa bún chả đặc sản Hà Nội, Xe máy lạnh đưa đón")
                            .itinerary("08:00 Đón khách - 08:30 Viếng Lăng Bác & Chùa Một Cột - 11:30 Văn Miếu - 14:30 Hồ Gươm, Đền Ngọc Sơn & Phố cổ")
                            .availableSlots(20)
                            .status("ACTIVE")
                            .build())
                );

                log.info("Initialized default Vietnam tour catalog dataset linked to landmarks");
            }
        };
    }

    @Bean
    public CommandLineRunner initHotels(HotelRepository hotelRepository, LocationRepository locationRepository) {
        return args -> {
            if (hotelRepository.count() == 0) {
                locationRepository.findByNameIgnoreCase("Vịnh Hạ Long").ifPresent(loc ->
                    hotelRepository.save(Hotel.builder()
                            .name("Vinpearl Resort & Spa Hạ Long")
                            .description("Khu nghỉ dưỡng 5 sao sang trọng hoàn toàn trên mặt biển với view 360 độ ngắm trọn vẹn Vịnh Hạ Long kỳ vĩ.")
                            .location(loc)
                            .province(loc.getProvince())
                            .address("Đảo Rều, Bãi Cháy, TP. Hạ Long, Quảng Ninh")
                            .stars(5)
                            .pricePerNight(new BigDecimal("2200000.00"))
                            .currency("VND")
                            .rating(4.9)
                            .reviewCount(156)
                            .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80")
                            .amenities("Hồ bơi vô cực ngoài trời, Spa Akoya cao cấp, Bãi biển riêng, Buffet sáng quốc tế, Wifi tốc độ cao")
                            .phone("02033556868")
                            .email("resort.halong@vinpearl.com")
                            .availableRooms(20)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Phố cổ Hội An").ifPresent(loc ->
                    hotelRepository.save(Hotel.builder()
                            .name("Anantara Hoi An Resort")
                            .description("Khu nghỉ dưỡng thanh bình ven sông Thu Bồn, kiến trúc kết hợp duyên dáng giữa phong cách Pháp cổ và truyền thống Hội An.")
                            .location(loc)
                            .province(loc.getProvince())
                            .address("1 Đường Phạm Hồng Thái, Cẩm Châu, Hội An, Quảng Nam")
                            .stars(5)
                            .pricePerNight(new BigDecimal("3150000.00"))
                            .currency("VND")
                            .rating(4.9)
                            .reviewCount(118)
                            .imageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80")
                            .amenities("Hồ bơi sân vườn nhiệt đới, Du thuyền ngắm hoàng hôn sông Thu Bồn, Lớp học nấu ăn truyền thống, Xe đạp miễn phí")
                            .phone("02353914555")
                            .email("hoian@anantara.com")
                            .availableRooms(15)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Cầu Vàng - Bà Nà Hills").ifPresent(loc ->
                    hotelRepository.save(Hotel.builder()
                            .name("Mercure Danang French Village Bana Hills")
                            .description("Khách sạn duy nhất tọa lạc trên đỉnh Bà Nà, mang không gian kiến trúc Gothic thế kỷ 19 lãng mạn giữa mây ngàn.")
                            .location(loc)
                            .province(loc.getProvince())
                            .address("Khu du lịch Bà Nà Hills, Hòa Ninh, Hòa Vang, Đà Nẵng")
                            .stars(4)
                            .pricePerNight(new BigDecimal("1850000.00"))
                            .currency("VND")
                            .rating(4.8)
                            .reviewCount(134)
                            .imageUrl("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80")
                            .amenities("Hồ bơi nước nóng trong nhà La Piscine, Check-in Cầu Vàng sớm không đông người, Rạp chiếu phim 4D")
                            .phone("02363799888")
                            .email("H8488-RE@accor.com")
                            .availableRooms(25)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Quần thể danh thắng Tràng An").ifPresent(loc ->
                    hotelRepository.save(Hotel.builder()
                            .name("Ninh Binh Hidden Charm Hotel & Resort")
                            .description("Tọa lạc giữa khung cảnh thiên nhiên thơ mộng gần bến thuyền Tam Cốc - Bích Động và quần thể Tràng An.")
                            .location(loc)
                            .province(loc.getProvince())
                            .address("Số 9, Trung tâm du lịch Tam Cốc, Ninh Thắng, Hoa Lư, Ninh Bình")
                            .stars(4)
                            .pricePerNight(new BigDecimal("1250000.00"))
                            .currency("VND")
                            .rating(4.7)
                            .reviewCount(89)
                            .imageUrl("https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80")
                            .amenities("Hồ bơi ngoài trời nhìn ra núi đá vôi, Nhà hàng ẩm thực địa phương, Spa & Massage thư giãn, Cho thuê xe đạp")
                            .phone("02293888555")
                            .email("info@hiddencharmresort.com")
                            .availableRooms(18)
                            .status("ACTIVE")
                            .build())
                );

                locationRepository.findByNameIgnoreCase("Hồ Hoàn Kiếm").ifPresent(loc ->
                    hotelRepository.save(Hotel.builder()
                            .name("Sofitel Legend Metropole Hanoi")
                            .description("Khách sạn 5 sao huyền thoại giữa trung tâm thủ đô gần Hồ Gươm, gìn giữ nét tinh hoa lịch sử từ năm 1901.")
                            .location(loc)
                            .province(loc.getProvince())
                            .address("15 Phố Ngô Quyền, Hoàn Kiếm, Hà Nội")
                            .stars(5)
                            .pricePerNight(new BigDecimal("4600000.00"))
                            .currency("VND")
                            .rating(4.9)
                            .reviewCount(210)
                            .imageUrl("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80")
                            .amenities("Hồ bơi ngoài trời Le Club, Hầm rượu lịch sử, Nhà hàng ẩm thực Pháp Le Beaulieu, Dịch vụ quản gia cao cấp")
                            .phone("02438266919")
                            .email("h1555@sofitel.com")
                            .availableRooms(12)
                            .status("ACTIVE")
                            .build())
                );

                log.info("Initialized default Vietnam hotel catalog dataset linked to landmarks");
            }
        };
    }
}

