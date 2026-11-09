package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    @Id
    private Long id;

    private String siteName;
    private String adminEmail;

    private Boolean emailNotify;
    private Boolean systemNotify;
    private Boolean maintenanceMode;
}