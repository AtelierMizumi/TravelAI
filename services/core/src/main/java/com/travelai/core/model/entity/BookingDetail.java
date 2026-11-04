package com.travelai.core.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "booking_details", indexes = {
        @Index(name = "idx_booking_details_booking_id", columnList = "booking_id")
})
public class BookingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType; // "TOUR" or "HOTEL"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "number_of_nights")
    private Integer numberOfNights = 1;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    public BookingDetail() {
    }

    public BookingDetail(Long id, Booking booking, String itemType, Tour tour, Hotel hotel,
                         String itemName, BigDecimal unitPrice, Integer quantity,
                         Integer numberOfNights, BigDecimal subtotal) {
        this.id = id;
        this.booking = booking;
        this.itemType = itemType;
        this.tour = tour;
        this.hotel = hotel;
        this.itemName = itemName;
        this.unitPrice = unitPrice;
        this.quantity = quantity != null ? quantity : 1;
        this.numberOfNights = numberOfNights != null ? numberOfNights : 1;
        this.subtotal = subtotal;
    }

    public static BookingDetailBuilder builder() {
        return new BookingDetailBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Tour getTour() {
        return tour;
    }

    public void setTour(Tour tour) {
        this.tour = tour;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getNumberOfNights() {
        return numberOfNights;
    }

    public void setNumberOfNights(Integer numberOfNights) {
        this.numberOfNights = numberOfNights;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public static class BookingDetailBuilder {
        private Long id;
        private Booking booking;
        private String itemType;
        private Tour tour;
        private Hotel hotel;
        private String itemName;
        private BigDecimal unitPrice;
        private Integer quantity = 1;
        private Integer numberOfNights = 1;
        private BigDecimal subtotal;

        public BookingDetailBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public BookingDetailBuilder booking(Booking booking) {
            this.booking = booking;
            return this;
        }

        public BookingDetailBuilder itemType(String itemType) {
            this.itemType = itemType;
            return this;
        }

        public BookingDetailBuilder tour(Tour tour) {
            this.tour = tour;
            return this;
        }

        public BookingDetailBuilder hotel(Hotel hotel) {
            this.hotel = hotel;
            return this;
        }

        public BookingDetailBuilder itemName(String itemName) {
            this.itemName = itemName;
            return this;
        }

        public BookingDetailBuilder unitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
            return this;
        }

        public BookingDetailBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public BookingDetailBuilder numberOfNights(Integer numberOfNights) {
            this.numberOfNights = numberOfNights;
            return this;
        }

        public BookingDetailBuilder subtotal(BigDecimal subtotal) {
            this.subtotal = subtotal;
            return this;
        }

        public BookingDetail build() {
            return new BookingDetail(id, booking, itemType, tour, hotel, itemName,
                    unitPrice, quantity, numberOfNights, subtotal);
        }
    }
}
