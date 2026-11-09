package com.travelai.backend.service;

import com.travelai.backend.booking.BookingService;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@Profile("!test")
public class ReminderService {
    private final BookingService bookings;
    public ReminderService(BookingService bookings) { this.bookings = bookings; }

    @Scheduled(fixedDelay = 60000)
    public void sendBookingReminders() { bookings.sendDueReminders(); }
}
