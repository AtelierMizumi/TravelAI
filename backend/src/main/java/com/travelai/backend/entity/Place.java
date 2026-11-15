package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String landmarkCode;
    private String province;
    private Double latitude;
    private Double longitude;
    private Boolean localModelEnabled;
    @Column(columnDefinition = "TEXT")
    private String imageAttribution;

    @Column(length = 5000)
    private String description;

    @Column(length = 1000)
    private String imageUrl;
}