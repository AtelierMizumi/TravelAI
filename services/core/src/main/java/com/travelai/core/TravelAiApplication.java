package com.travelai.core;

import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

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
}
