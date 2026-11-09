package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_holiday_calendars")
class HolidayCalendar {
    @Id String id;
    int calendarYear;
    @Column(nullable=false) String version;
    @Column(nullable=false, columnDefinition="text") String source;
    boolean approved;
    long approvedBy;
    Instant approvedAt;
    @Column(nullable=false, columnDefinition="text") String dates;
}
