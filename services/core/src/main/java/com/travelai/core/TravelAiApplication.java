package com.travelai.core;

import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
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
}
