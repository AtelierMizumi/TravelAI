package com.travelai.backend.booking;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService.Actor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.*;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import com.travelai.backend.security.SessionService;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.context.annotation.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static com.travelai.backend.booking.BookingContracts.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(BookingTransactionsTest.TimeConfiguration.class)
class BookingTransactionsTest {
    static class TestClock extends Clock {
        volatile Instant now = Instant.parse("2026-01-01T00:00:00Z");
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return Clock.fixed(now, zone); }
        public Instant instant() { return now; }
    }
    @TestConfiguration static class TimeConfiguration {
        @Bean @Primary TestClock testClock() { return new TestClock(); }
    }
    @Autowired BookingService service;
    @Autowired UserRepository users;
    @Autowired TestClock clock;
    @Autowired MockMvc mvc;
    @Autowired SessionService sessions;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @Autowired com.travelai.backend.repository.NotificationRepository notifications;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper json;
    Actor admin;
    Actor traveler;
    Map<String,Object> card;
    String offering;
    final Instant first = Instant.parse("2026-06-01T03:00:00Z");
    final Instant second = Instant.parse("2026-06-02T03:00:00Z");

    @BeforeEach void fixture() {
        clock.now = Instant.parse("2026-01-01T00:00:00Z");
        admin = user("ADMIN");
        traveler = user("USER");
        card = service.provisionBank(admin, new BankInput(traveler.id(), 1000, 12, 2027), key());
        service.linkBank(traveler,new BankLinkInput((String)card.get("bankName"),(String)card.get("cardId"),(String)card.get("testCvv")));
        offering = (String) service.saveOffer(admin, new OfferInput(null,"TOUR",null,"Synthetic tour",true,
                new Policy(24,24,30,10,null),null,null,
                List.of(new Departure(first,1,List.of("1"),100),new Departure(second,1,List.of("1"),160)),null)).get("id");
        service.publishCalendar(admin,new CalendarInput(2026,"Synthetic official-calendar fixture",Set.of(LocalDate.of(2026,6,2)),true));
    }
    Actor user(String role) {
        User user = new User();
        user.setEmail(key()+"@example.test"); user.setRole(role); user.setStatus("active");
        user.setPassword("synthetic-fixture");
        return new Actor(users.saveAndFlush(user).getId(),role);
    }
    String key() { return UUID.randomUUID().toString(); }
    Map<String,Object> review(Actor actor, Instant departure, Map<String,Object> existing) {
        return service.review(actor,new ReviewInput(offering, existing==null?null:(String) existing.get("id"),
                existing==null?null:((Number)existing.get("revision")).longValue(),departure,null,null,1,List.of("1"),null,null),key());
    }
    Map<String,Object> pay(Actor actor, Map<String,Object> review, Map<String,Object> credentials, String key) {
        return service.pay(actor,(String)review.get("id"),new PayInput((String)review.get("digest"),true,
                (String)credentials.get("cardId"),(String)credentials.get("testCvv")),key);
    }
    long balance() { return ((Number)service.bank(traveler).get("balance")).longValue(); }

    @Test void apiRequiresSessionAndAdministratorPrivileges() throws Exception {
        mvc.perform(get("/api/booking/offers")).andExpect(status().isOk());
        mvc.perform(get("/api/booking/bank")).andExpect(status().isUnauthorized());
        String email = users.findById(traveler.id()).orElseThrow().getEmail();
        String token = (String)sessions.login(email,"synthetic-fixture").get("token");
        mvc.perform(post("/api/booking/offers").header("Authorization","Bearer "+token)
                .contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/booking/bank").header("Authorization","Bearer "+token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.simulation").value("SIMULATED"))
                .andExpect(jsonPath("$.cards[0].testCvv").doesNotExist());
    }
    @Test void hotelProvinceCanBeSetWithoutErasingItFromOlderClients() throws Exception {
        String token=bearer(admin);
        String created=mvc.perform(post("/api/hotels").header("Authorization",token).contentType("application/json")
                .content("{\"name\":\"Synthetic hotel\",\"location\":\"Synthetic area\",\"province\":\"Gia Lai\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.province").value("Gia Lai")).andReturn().getResponse().getContentAsString();
        long id=json.readTree(created).get("id").asLong();
        mvc.perform(put("/api/hotels/"+id).header("Authorization",token).contentType("application/json")
                .content("{\"name\":\"Synthetic updated\",\"location\":\"Synthetic area\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.province").value("Gia Lai"));
    }
    String bearer(Actor actor) {
        String email = users.findById(actor.id()).orElseThrow().getEmail();
        return "Bearer " + sessions.login(email, "synthetic-fixture").get("token");
    }
    @Test void sessionRestoreAndDirectoryExposeOnlyAllowedFields() throws Exception {
        String token = bearer(traveler);
        mvc.perform(get("/api/auth/me").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(traveler.id()))
                .andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(get("/api/people").header("Authorization", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist());
        mvc.perform(get("/api/system-settings")).andExpect(status().isOk());
        mvc.perform(put("/api/system-settings").header("Authorization", token).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
    }
    @Test void messagingRetriesOnceAndRejectsOutsiders() throws Exception {
        Actor recipient = user("USER");
        String token = bearer(traveler);
        String content = json.writeValueAsString(Map.of("receiverId",recipient.id(),"content","Synthetic message",
                "clientMessageId", key(), "senderId",admin.id()));
        String path = "/api/chat/send";
        String response = mvc.perform(post(path).header("Authorization",token).contentType("application/json").content(content))
                .andExpect(status().isOk()).andExpect(jsonPath("$.senderId").value(traveler.id())).andReturn().getResponse().getContentAsString();
        long messageId = json.readTree(response).get("id").asLong();
        var stored = jdbc.queryForMap("select content, content_encryption from chat_messages where id=?", messageId);
        assertNotEquals("Synthetic message", stored.get("content"));
        assertEquals("AES256_GCM_V1", stored.get("content_encryption"));
        mvc.perform(post(path).header("Authorization",token).contentType("application/json").content(content))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(messageId));
        mvc.perform(get("/api/chat/inbox/"+traveler.id()).header("Authorization",token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].content").value("Synthetic message"));
        mvc.perform(get("/api/chat/conversation").param("user1",Long.toString(traveler.id())).param("user2",Long.toString(recipient.id()))
                .header("Authorization",bearer(admin))).andExpect(status().isForbidden());
        String notifications = mvc.perform(get("/api/notifications/"+recipient.id()).header("Authorization",bearer(recipient)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andReturn().getResponse().getContentAsString();
        long notificationId = json.readTree(notifications).get(0).get("id").asLong();
        mvc.perform(put("/api/notifications/read/"+notificationId).header("Authorization",token)).andExpect(status().isForbidden());
    }
    @Test void voiceMessagesUseEncryptionAndIdempotentDelivery() throws Exception {
        Actor recipient=user("USER"); String token=bearer(traveler);
        byte[] synthetic=new byte[]{0x1a,0x45,(byte)0xdf,(byte)0xa3,0,0,0,0,0,0,0,0};
        String audio="VOICE_V1|audio/webm|"+Base64.getEncoder().encodeToString(synthetic);
        String input=json.writeValueAsString(Map.of("receiverId",recipient.id(),"content",audio,"clientMessageId",key()));
        String response=mvc.perform(post("/api/chat/send").header("Authorization",token).contentType("application/json").content(input))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").value(audio)).andReturn().getResponse().getContentAsString();
        long id=json.readTree(response).get("id").asLong();
        var stored=jdbc.queryForMap("select content, content_encryption from chat_messages where id=?",id);
        assertNotEquals(audio,stored.get("content")); assertEquals("AES256_GCM_V1",stored.get("content_encryption"));
        mvc.perform(post("/api/chat/send").header("Authorization",token).contentType("application/json").content(input)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        mvc.perform(get("/api/chat/inbox/"+recipient.id()).header("Authorization",bearer(recipient))).andExpect(status().isOk()).andExpect(jsonPath("$[0].content").value("[Tin nhắn thoại]"));
        String invalid=json.writeValueAsString(Map.of("receiverId",recipient.id(),"content","VOICE_V1|audio/webm|ZmFrZQ==","clientMessageId",key()));
        mvc.perform(post("/api/chat/send").header("Authorization",token).contentType("application/json").content(invalid)).andExpect(status().isBadRequest());
    }
    @Test void moderationAndProfileOwnershipUseServerIdentity() throws Exception {
        String token = bearer(traveler);
        String response = mvc.perform(post("/api/posts").header("Authorization",token).contentType("application/json")
                .content(json.writeValueAsString(Map.of("authorId", admin.id(), "authorName","Forged", "content","Synthetic post"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.authorId").value(traveler.id()))
                .andExpect(jsonPath("$.status").value("PENDING")).andReturn().getResponse().getContentAsString();
        long postId = json.readTree(response).get("id").asLong();
        mvc.perform(put("/api/posts/"+postId+"/approve").header("Authorization",token)).andExpect(status().isForbidden());
        Actor outsider = user("USER");
        mvc.perform(put("/api/posts/"+postId).header("Authorization",bearer(outsider)).contentType("application/json").content("{\"content\":\"Forged edit\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/posts/"+postId+"/approve").header("Authorization",bearer(admin))).andExpect(status().isOk());
        mvc.perform(get("/api/posts/user/"+traveler.id()).header("Authorization",bearer(outsider)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    }
    @Test void reviewRetrievalAndCatalogDetailsMatchCrossPlatformContract() throws Exception {
        var held = review(traveler,first,null);
        String token = bearer(traveler);
        mvc.perform(get("/api/booking/reviews/"+held.get("id")).header("Authorization",token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quote.total").value(100))
                .andExpect(jsonPath("$.quote.itinerary.timezone").value("Asia/Ho_Chi_Minh"));
        mvc.perform(get("/api/booking/reviews/"+held.get("id")).header("Authorization",bearer(user("USER"))))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/booking/admin/offers").header("Authorization",token)).andExpect(status().isForbidden());
        String place = mvc.perform(post("/api/places").header("Authorization",bearer(admin)).contentType("application/json")
                .content("{\"name\":\"Synthetic place\",\"description\":\"Synthetic description\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long placeId = json.readTree(place).get("id").asLong();
        mvc.perform(get("/api/places/"+placeId)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Synthetic place"));
    }
    @Test void availabilityExcludesReplaceableOwnHoldsAndProtectsOtherTravelers() throws Exception {
        review(traveler, first, null);
        String path = "/api/booking/offers/"+offering+"/availability";
        String own = mvc.perform(get(path).header("Authorization",bearer(traveler))).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertTrue(json.readTree(own).isEmpty());
        Actor other = user("USER");
        String occupied = mvc.perform(get(path).header("Authorization",bearer(other))).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertEquals(1,json.readTree(occupied).get(offering+"|T|"+first+"|1").asInt());
    }
    @Test void completedReviewCanRecoverBookingAfterClientReload() throws Exception {
        var held = review(traveler,first,null);
        var booking = pay(traveler,held,card,key());
        mvc.perform(get("/api/booking/reviews/"+held.get("id")).header("Authorization",bearer(traveler)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.booking.id").value(booking.get("id")));
        String stats = mvc.perform(get("/api/admin/stats").header("Authorization",bearer(admin)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertTrue(json.readTree(stats).get("tourBookings").asLong() > 0);
        assertEquals(900,balance());
    }
    @Test void physicalHotelRoomsRejectOverlapAndAllowAdjacentStays() {
        String hotel = (String)service.saveOffer(admin,new OfferInput(null,"HOTEL",null,"Synthetic hotel",true,
                new Policy(24,24,30,10,null),LocalTime.of(14,0),LocalTime.of(12,0),List.of(),
                List.of(new Room("R1","101",2,100,Map.of())))).get("id");
        ReviewInput stay = new ReviewInput(hotel,null,null,null,LocalDate.of(2026,6,1),LocalDate.of(2026,6,3),
                2,List.of(),Map.of("R1",2),Map.of());
        var held = service.review(traveler,stay,key());
        assertEquals(200,((Quote)held.get("quote")).total());
        pay(traveler,held,card,key());
        Actor other = user("USER");
        assertThrows(ResponseStatusException.class,()->service.review(other,stay,key()));
        ReviewInput adjacent = new ReviewInput(hotel,null,null,null,LocalDate.of(2026,6,3),LocalDate.of(2026,6,4),
                2,List.of(),Map.of("R1",2),Map.of());
        assertEquals("PENDING",service.review(other,adjacent,key()).get("status"));
        assertEquals(800,balance());
    }
    @Test void legacyShortPasswordUpgradesWhileNewPasswordsKeepTheirMinimum() {
        User legacy = users.findById(traveler.id()).orElseThrow();
        legacy.setPassword("old123"); users.saveAndFlush(legacy);
        var login = sessions.login(legacy.getEmail(), "old123");
        assertTrue(users.findById(legacy.getId()).orElseThrow().getPassword().startsWith("pbkdf2$"));
        assertEquals(traveler.id(),sessions.authenticate("Bearer "+login.get("token")).id());
        assertThrows(IllegalArgumentException.class,()->com.travelai.backend.security.PasswordHashes.encode("old123"));
    }
    @Test void bookingRemindersAreTimedAndIdempotent() {
        var booking = pay(traveler,review(traveler,first,null),card,key());
        clock.now = first.minus(Duration.ofHours(24));
        service.sendDueReminders(); service.sendDueReminders();
        var notices = notifications.findByUserIdOrderByCreatedAtDesc(traveler.id());
        assertEquals(1,notices.stream().filter(n -> "REMINDER_24H".equals(n.getType()) && booking.get("id").equals(n.getTargetReference())).count());
        assertEquals(0,notices.stream().filter(n -> "REMINDER_1H".equals(n.getType())).count());
        clock.now = first.minus(Duration.ofHours(1));
        service.sendDueReminders(); service.sendDueReminders();
        notices = notifications.findByUserIdOrderByCreatedAtDesc(traveler.id());
        assertEquals(1,notices.stream().filter(n -> "REMINDER_1H".equals(n.getType()) && booking.get("id").equals(n.getTargetReference())).count());
    }
    @Test void ratingsRequireOwnerAndCompletedItineraryAndAreUnique() throws Exception {
        offering = (String) service.saveOffer(admin,new OfferInput(null,"TOUR",701L,"Synthetic rated tour",true,
                new Policy(24,24,30,10,null),null,null,
                List.of(new Departure(first,1,List.of("1"),100,first.plus(Duration.ofHours(6)))),null)).get("id");
        var booking=pay(traveler,review(traveler,first,null),card,key());
        String input=json.writeValueAsString(Map.of("bookingId",booking.get("id"),"stars",5,"comment","Synthetic review","image","data:image/jpeg;base64,/9j/"));
        mvc.perform(post("/api/ratings").header("Authorization",bearer(traveler)).contentType("application/json").content(input)).andExpect(status().isConflict());
        clock.now=first.plus(Duration.ofHours(6));
        mvc.perform(post("/api/ratings").header("Authorization",bearer(user("USER"))).contentType("application/json").content(input)).andExpect(status().isNotFound());
        mvc.perform(post("/api/ratings").header("Authorization",bearer(traveler)).contentType("application/json").content(input)).andExpect(status().isOk()).andExpect(jsonPath("$.stars").value(5));
        mvc.perform(post("/api/ratings").header("Authorization",bearer(traveler)).contentType("application/json").content(input)).andExpect(status().isConflict());
        mvc.perform(get("/api/ratings/TOUR/701")).andExpect(status().isOk()).andExpect(jsonPath("$.items[0].comment").value("Synthetic review"));
        mvc.perform(get("/api/ratings/TOUR/701").param("stars","4")).andExpect(status().isOk()).andExpect(jsonPath("$.count").value(0));
    }
    @Test void unknownTourEndCannotBeRated() throws Exception {
        var booking=pay(traveler,review(traveler,first,null),card,key());
        clock.now=first.plus(Duration.ofDays(1));
        String input=json.writeValueAsString(Map.of("bookingId",booking.get("id"),"stars",4,"comment","Synthetic review"));
        mvc.perform(post("/api/ratings").header("Authorization",bearer(traveler)).contentType("application/json").content(input)).andExpect(status().isConflict());
    }
    @Test void promotionAppliesToTourAndReschedulingPolicyUsesAmountActuallyPaid() {
        offering=(String)service.saveOffer(admin,new OfferInput(null,"TOUR",701L,"Synthetic sale",true,
                new Policy(24,24,30,10,null),null,null,
                List.of(new Departure(first,1,List.of("1"),100),new Departure(second,1,List.of("1"),160)),null,
                new Promotion(LocalDate.of(2026,6,1),LocalDate.of(2026,6,1),20))).get("id");
        var initial=review(traveler,first,null);
        assertEquals(80,((Quote)initial.get("quote")).total());
        var booked=pay(traveler,initial,card,key()); assertEquals(920,balance());
        Quote change=(Quote)review(traveler,second,booked).get("quote");
        assertEquals(16,change.fee()); assertEquals(80,change.holidayDifference()); assertEquals(96,change.total());
    }
    @Test void promotionAppliesOnlyToHotelNightsInConfiguredRange() {
        String hotel=(String)service.saveOffer(admin,new OfferInput(null,"HOTEL",702L,"Synthetic sale hotel",true,
                new Policy(24,24,30,10,null),LocalTime.of(14,0),LocalTime.of(12,0),List.of(),
                List.of(new Room("R1","101",2,100,Map.of())),new Promotion(LocalDate.of(2026,6,1),LocalDate.of(2026,6,1),20))).get("id");
        ReviewInput stay=new ReviewInput(hotel,null,null,null,LocalDate.of(2026,6,1),LocalDate.of(2026,6,3),1,List.of(),Map.of("R1",1),Map.of());
        Quote quote=(Quote)service.review(traveler,stay,key()).get("quote");
        assertEquals(180,quote.total()); assertEquals(List.of(80L,100L),quote.itinerary().roomPrices().get("R1"));
    }
    @Test void repeatedPaymentChargesOnce() {
        var review = review(traveler,first,null);
        String operation = key();
        var booking = pay(traveler,review,card,operation);
        assertEquals("CONFIRMED",booking.get("status"));
        assertEquals(booking.get("id"),pay(traveler,review,card,operation).get("id"));
        assertEquals(900,balance());
        assertEquals(1,((List<?>)service.bank(traveler).get("transactions")).size());
        assertEquals(1, notifications.findByUserIdOrderByCreatedAtDesc(traveler.id()).stream()
                .filter(item -> "BOOKING_CONFIRMED".equals(item.getType())).count());
    }
    @Test void declinedPaymentIsRecordedOnceAndCanBeRetried() {
        var held=review(traveler,first,null);
        var invalid=new HashMap<>(card); invalid.put("testCvv","TEST-invalid");
        String retry=key();
        assertEquals("FAILED",pay(traveler,held,invalid,retry).get("status"));
        assertEquals("FAILED",pay(traveler,held,invalid,retry).get("status"));
        var attempts=(List<?>)service.bank(traveler).get("paymentAttempts");
        assertEquals(1,attempts.size()); assertEquals(1000,balance());
        assertEquals("CONFIRMED",pay(traveler,held,card,key()).get("status"));
        assertEquals(2,((List<?>)service.bank(traveler).get("paymentAttempts")).size()); assertEquals(900,balance());
    }
    @Test void bankLinkRequiresSyntheticCredentialsAndOwner() {
        Actor other=user("USER");
        assertThrows(ResponseStatusException.class,()->service.linkBank(other,new BankLinkInput((String)card.get("bankName"),(String)card.get("cardId"),(String)card.get("testCvv"))));
        assertThrows(ResponseStatusException.class,()->service.linkBank(traveler,new BankLinkInput((String)card.get("bankName"),"974203789","123")));
    }
    @Test void insufficientBalanceRecordsDeclineWithoutChargingOrConfirming() {
        jdbc.update("update simulated_accounts set balance=50 where owner_id=?",traveler.id());
        var held=review(traveler,first,null);
        assertEquals("FAILED",pay(traveler,held,card,key()).get("status"));
        assertEquals(50,balance());
        assertEquals(0,service.bookings(traveler).size());
        var attempts=(List<?>)service.bank(traveler).get("paymentAttempts");
        assertEquals(1,attempts.size());
        assertEquals("FAILED",((Map<?,?>)attempts.getFirst()).get("status"));
    }
    @Test void failedChangePreservesOriginalAndSuccessfulChangeChargesHolidayAndFixedFee() {
        var original = pay(traveler,review(traveler,first,null),card,key());
        var change = review(traveler,second,original);
        Quote quote = (Quote)change.get("quote");
        assertEquals(20,quote.fee()); assertEquals(60,quote.holidayDifference()); assertEquals(80,quote.total());
        var invalid = new HashMap<>(card); invalid.put("testCvv","TEST-invalid");
        assertEquals("FAILED",pay(traveler,change,invalid,key()).get("status"));
        assertEquals(900,balance());
        assertEquals(1L,((Number)service.bookings(traveler).getFirst().get("revision")).longValue());
        var updated = pay(traveler,change,card,key());
        assertEquals(original.get("id"),updated.get("id")); assertEquals(820,balance());
        var refund = service.cancel(traveler,(String)updated.get("id"),new CancelInput("VOLUNTARY"),key());
        assertEquals("CANCELLED",((Map<?,?>)refund.get("booking")).get("status")); assertEquals(937,balance());
    }
    @Test void unpaidHoldExpiresAtExactBoundary() {
        var held = review(traveler,first,null);
        Actor other = user("USER");
        assertThrows(ResponseStatusException.class,()->review(other,first,null));
        clock.now = Instant.parse((String)held.get("expiresAt"));
        assertNotNull(review(other,first,null));
        assertThrows(ResponseStatusException.class,()->pay(traveler,held,card,key()));
        assertEquals(1000,balance());
    }
    @Test void successfulReschedulingReleasesOriginalSeatForAnotherTraveler() {
        var original = pay(traveler,review(traveler,first,null),card,key());
        var change = review(traveler,second,original);
        Actor other = user("USER");
        assertThrows(ResponseStatusException.class,()->review(other,first,null));
        pay(traveler,change,card,key());
        assertNotNull(review(other,first,null));
    }
    @Test void exactCurrentDeadlineRejectsWithoutDebit() {
        var original = pay(traveler,review(traveler,first,null),card,key());
        clock.now = first.minus(Duration.ofHours(24));
        assertThrows(ResponseStatusException.class,()->review(traveler,second,original));
        assertEquals(900,balance());
        assertEquals("CONFIRMED",service.bookings(traveler).getFirst().get("status"));
    }
    @Test void concurrentDuplicatePaymentProducesOneCharge() throws Exception {
        var held = review(traveler,first,null);
        String operation = key();
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            Future<Map<String,Object>> a = pool.submit(()->pay(traveler,held,card,operation));
            Future<Map<String,Object>> b = pool.submit(()->pay(traveler,held,card,operation));
            assertEquals(a.get(10,TimeUnit.SECONDS).get("id"),b.get(10,TimeUnit.SECONDS).get("id"));
        }
        assertEquals(900,balance());
        assertEquals(1,((List<?>)service.bank(traveler).get("transactions")).size());
    }
    @Test void concurrentLastSeatAllowsOnlyOneHold() throws Exception {
        Actor other = user("USER");
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            CountDownLatch start = new CountDownLatch(1);
            List<Future<Boolean>> results = new ArrayList<>();
            for (Actor actor : List.of(traveler,other)) results.add(pool.submit(()-> {
                start.await();
                try { review(actor,first,null); return true; }
                catch(ResponseStatusException unavailable) { return false; }
            }));
            start.countDown();
            int successes = 0;
            for (Future<Boolean> result : results) if(result.get(10,TimeUnit.SECONDS)) successes++;
            assertEquals(1,successes);
        }
    }
}
