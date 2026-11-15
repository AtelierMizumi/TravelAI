package com.travelai.backend.booking;

import com.travelai.backend.security.ApiSecurity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static com.travelai.backend.booking.BookingContracts.*;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping("/admin/offers")
    public List<Map<String,Object>> adminOffers(HttpServletRequest request) {
        return service.adminOffers(ApiSecurity.actor(request));
    }

    @GetMapping("/admin/calendars")
    public List<Map<String,Object>> calendarHistory(HttpServletRequest request) {
        return service.calendarHistory(ApiSecurity.actor(request));
    }

    @PutMapping("/bank/cards/{id}")
    public Map<String,Object> cardStatus(HttpServletRequest request, @PathVariable String id, @RequestBody Map<String,String> input) {
        return service.cardStatus(ApiSecurity.actor(request), id, input.get("status"));
    }

    @GetMapping("/offers")
    public List<Map<String,Object>> offers() {
        return service.offers();
    }

    @GetMapping("/offers/{id}/availability")
    public Map<String,Integer> availability(HttpServletRequest request, @PathVariable String id, @RequestParam(required=false) String bookingId) {
        return service.availabilityView(ApiSecurity.actor(request), id, bookingId);
    }

    @GetMapping("/reviews/{id}")
    public Map<String,Object> review(HttpServletRequest request, @PathVariable String id) {
        return service.getReview(ApiSecurity.actor(request), id);
    }

    @PostMapping("/offers")
    public Map<String,Object> saveOffer(HttpServletRequest request, @RequestBody OfferInput input) {
        return service.saveOffer(ApiSecurity.actor(request), input);
    }

    @PostMapping("/calendars")
    public Map<String,Object> publishCalendar(HttpServletRequest request, @RequestBody CalendarInput input) {
        return service.publishCalendar(ApiSecurity.actor(request), input);
    }

    @PostMapping("/bank/accounts")
    public Map<String,Object> provisionBank(HttpServletRequest request, @RequestBody BankInput input,
                                          @RequestHeader("Idempotency-Key") String key) {
        return service.provisionBank(ApiSecurity.actor(request), input, key);
    }

    @GetMapping("/bank")
    public Map<String,Object> bank(HttpServletRequest request) {
        return service.bank(ApiSecurity.actor(request));
    }

    @PostMapping("/bank/link")
    public Map<String,Object> linkBank(HttpServletRequest request, @RequestBody BankLinkInput input) {
        return service.linkBank(ApiSecurity.actor(request), input);
    }
    @GetMapping("/bank/institutions")
    public List<String> institutions(HttpServletRequest request) {
        ApiSecurity.actor(request);
        return service.institutions();
    }

    @PostMapping("/reviews")
    public Map<String,Object> review(HttpServletRequest request, @RequestBody ReviewInput input,
                                     @RequestHeader("Idempotency-Key") String key) {
        return service.review(ApiSecurity.actor(request), input, key);
    }

    @PostMapping("/reviews/{id}/pay")
    public Map<String,Object> pay(HttpServletRequest request, @PathVariable String id,
                                  @RequestBody PayInput input, @RequestHeader("Idempotency-Key") String key) {
        return service.pay(ApiSecurity.actor(request), id, input, key);
    }

    @GetMapping("/bookings")
    public List<Map<String,Object>> bookings(HttpServletRequest request) {
        return service.bookings(ApiSecurity.actor(request));
    }

    @GetMapping("/bookings/{id}/history")
    public List<Map<String,Object>> history(HttpServletRequest request, @PathVariable String id) {
        return service.history(ApiSecurity.actor(request), id);
    }

    @PostMapping("/bookings/{id}/cancel")
    public Map<String,Object> cancel(HttpServletRequest request, @PathVariable String id,
                                     @RequestBody CancelInput input, @RequestHeader("Idempotency-Key") String key) {
        return service.cancel(ApiSecurity.actor(request), id, input, key);
    }

    @PostMapping("/bookings/{id}/no-show")
    public Map<String,Object> noShow(HttpServletRequest request, @PathVariable String id,
                                     @RequestBody NoShowInput input, @RequestHeader("Idempotency-Key") String key) {
        return service.noShow(ApiSecurity.actor(request), id, input, key);
    }

    @PostMapping("/bookings/{id}/correct-no-show")
    public Map<String,Object> correctNoShow(HttpServletRequest request, @PathVariable String id,
                                          @RequestBody CancelInput input, @RequestHeader("Idempotency-Key") String key) {
        return service.correctNoShow(ApiSecurity.actor(request), id, input.reason(), key);
    }
}
