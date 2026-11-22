package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String province;

    private Double rating;
    private Integer rooms;
    private Double price;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String image;
    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name = "scene_order")
    @Builder.Default
    private java.util.List<ImmersiveScene> scenes = new java.util.ArrayList<>();
}
