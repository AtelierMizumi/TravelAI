package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/** A real equirectangular photograph, never a stock photo projected as a room. */
@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ImmersiveScene {
    @Column(length = 120) private String label;
    @Column(length = 2048) private String panoramaUrl;
    @Column(length = 1000) private String attribution;
    @Column(length = 2048) private String sourceUrl;
    @Column(length = 20) private String category;
}
