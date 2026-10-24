package com.travelai.core.service.impl;

import com.travelai.core.dto.request.BookingCreateRequest;
import com.travelai.core.dto.request.PaymentProcessRequest;
import com.travelai.core.dto.response.BookingResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Booking;
import com.travelai.core.model.entity.BookingDetail;
import com.travelai.core.model.entity.Hotel;
import com.travelai.core.model.entity.Payment;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.BookingDetailRepository;
import com.travelai.core.repository.BookingRepository;
import com.travelai.core.repository.HotelRepository;
import com.travelai.core.repository.PaymentRepository;
import com.travelai.core.repository.TourRepository;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final HotelRepository hotelRepository;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            BookingDetailRepository bookingDetailRepository,
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            TourRepository tourRepository,
            HotelRepository hotelRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.tourRepository = tourRepository;
        this.hotelRepository = hotelRepository;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(String username, BookingCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        int quantity = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        BigDecimal unitPrice;
        BigDecimal subtotal;
        BookingDetail detail;
        LocalDate endDate = request.getEndDate();

        if ("TOUR".equalsIgnoreCase(request.getBookingType())) {
            if (request.getTourId() == null) {
                throw new BadRequestException("tourId is required when bookingType is TOUR");
            }
            Tour tour = tourRepository.findById(request.getTourId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + request.getTourId()));

            if (tour.getAvailableSlots() != null && tour.getAvailableSlots() < quantity) {
                throw new BadRequestException("Số chỗ trống không đủ. Còn lại: " + tour.getAvailableSlots() + " chỗ.");
            }

            unitPrice = tour.getPrice();
            subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            detail = BookingDetail.builder()
                    .itemType("TOUR")
                    .tour(tour)
                    .itemName(tour.getTitle())
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .numberOfNights(1)
                    .subtotal(subtotal)
                    .build();

        } else if ("HOTEL".equalsIgnoreCase(request.getBookingType())) {
            if (request.getHotelId() == null) {
                throw new BadRequestException("hotelId is required when bookingType is HOTEL");
            }
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));

            int nights = (request.getNumberOfNights() != null && request.getNumberOfNights() > 0)
                    ? request.getNumberOfNights()
                    : 1;

            if (endDate == null) {
                endDate = request.getStartDate().plusDays(nights);
            }

            if (hotel.getAvailableRooms() != null && hotel.getAvailableRooms() < quantity) {
                throw new BadRequestException("Số phòng trống không đủ. Còn lại: " + hotel.getAvailableRooms() + " phòng.");
            }

            unitPrice = hotel.getPricePerNight();
            subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity)).multiply(BigDecimal.valueOf(nights));

            detail = BookingDetail.builder()
                    .itemType("HOTEL")
                    .hotel(hotel)
                    .itemName(hotel.getName())
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .numberOfNights(nights)
                    .subtotal(subtotal)
                    .build();

        } else {
            throw new BadRequestException("Loại đặt chỗ không hợp lệ: " + request.getBookingType() + ". Chỉ chấp nhận TOUR hoặc HOTEL.");
        }

        String bookingCode = "BK-" + (System.currentTimeMillis() % 100000000) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .bookingType(request.getBookingType().toUpperCase())
                .status("PENDING")
                .totalAmount(subtotal)
                .currency("VND")
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .specialRequests(request.getSpecialRequests())
                .startDate(request.getStartDate())
                .endDate(endDate)
                .build();

        booking.addItem(detail);
        Booking savedBooking = bookingRepository.save(booking);

        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod().toUpperCase()
                : "MOCK_GATEWAY";

        String txnCode = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String paymentUrl = "https://payment.travelai.vn/checkout?code=" + txnCode + "&amount=" + savedBooking.getTotalAmount();

        Payment payment = Payment.builder()
                .booking(savedBooking)
                .transactionCode(txnCode)
                .paymentMethod(paymentMethod)
                .amount(savedBooking.getTotalAmount())
                .currency("VND")
                .status("PENDING")
                .paymentUrl(paymentUrl)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        log.info("Created booking id={} code={} user={} totalAmount={}",
                savedBooking.getId(), savedBooking.getBookingCode(), username, savedBooking.getTotalAmount());

        return BookingResponse.fromEntity(savedBooking, savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(String username, Long bookingId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        validateOwnershipOrAdmin(booking, username, isAdmin);

        Payment payment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId).orElse(null);
        return BookingResponse.fromEntity(booking, payment);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String username, String bookingCode, boolean isAdmin) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with code: " + bookingCode));

        validateOwnershipOrAdmin(booking, username, isAdmin);

        Payment payment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(booking.getId()).orElse(null);
        return BookingResponse.fromEntity(booking, payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getUserBookings(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return bookingRepository.findByUserId(user.getId(), pageable)
                .map(b -> {
                    Payment p = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(b.getId()).orElse(null);
                    return BookingResponse.fromEntity(b, p);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> searchAllBookings(String status, String bookingType, String keyword, Pageable pageable) {
        return bookingRepository.searchBookings(status, bookingType, keyword, pageable)
                .map(b -> {
                    Payment p = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(b.getId()).orElse(null);
                    return BookingResponse.fromEntity(b, p);
                });
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String username, Long bookingId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        validateOwnershipOrAdmin(booking, username, isAdmin);

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            Payment p = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId).orElse(null);
            return BookingResponse.fromEntity(booking, p);
        }

        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Không thể hủy đơn đặt chỗ đã hoàn thành.");
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        log.info("Cancelled booking id={} by user={}", bookingId, username);

        Payment payment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId).orElse(null);
        return BookingResponse.fromEntity(saved, payment);
    }

    @Override
    @Transactional
    public BookingResponse processPayment(String username, Long bookingId, PaymentProcessRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        User user = userRepository.findByUsername(username).orElse(null);
        boolean isAdmin = user != null && user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName().name());
        validateOwnershipOrAdmin(booking, username, isAdmin);

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Không thể thanh toán cho đơn đặt chỗ đã bị hủy.");
        }

        Payment payment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId)
                .orElseGet(() -> {
                    String txnCode = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
                    Payment newP = Payment.builder()
                            .booking(booking)
                            .transactionCode(txnCode)
                            .amount(booking.getTotalAmount())
                            .currency("VND")
                            .status("PENDING")
                            .build();
                    return paymentRepository.save(newP);
                });

        boolean isSuccess = request == null || request.getSimulateSuccess() == null || Boolean.TRUE.equals(request.getSimulateSuccess());

        if (request != null && request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            payment.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        }

        if (isSuccess) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionRef("GW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            booking.setStatus("PAID");
            String voucherCode = "VCH-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now()) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            booking.setVoucherCode(voucherCode);

            log.info("Payment succeeded for booking id={} voucherCode={}", bookingId, voucherCode);
        } else {
            payment.setStatus("FAILED");
            log.warn("Payment failed for booking id={}", bookingId);
        }

        paymentRepository.save(payment);
        Booking saved = bookingRepository.save(booking);

        return BookingResponse.fromEntity(saved, payment);
    }

    private void validateOwnershipOrAdmin(Booking booking, String username, boolean isAdmin) {
        if (!isAdmin && (booking.getUser() == null || !booking.getUser().getUsername().equals(username))) {
            throw new AccessDeniedException("Bạn không có quyền truy cập đơn đặt chỗ này.");
        }
    }
}
