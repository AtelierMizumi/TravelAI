package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hotel_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userName;
    private String hotelName;

    private Double unitPrice;
    private Double price;

    private Integer rooms;
    private Integer guests;

    private String checkIn;
    private String checkOut;

    private String status;
    private LocalDateTime createdAt;
}