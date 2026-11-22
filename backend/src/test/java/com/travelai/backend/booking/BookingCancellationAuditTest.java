package com.travelai.backend.booking;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.NotificationRepository;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService;
import com.travelai.backend.security.SessionService.Actor;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static com.travelai.backend.booking.BookingContracts.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Synthetic PostgreSQL audit. Never targets the demo database or a real payment provider. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(BookingTransactionsTest.TimeConfiguration.class)
class BookingCancellationAuditTest {
    @Autowired BookingService service;
    @Autowired UserRepository users;
    @Autowired BookingTransactionsTest.TestClock clock;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @Autowired SessionService sessions;
    @Autowired NotificationRepository notices;
    @Autowired PlatformTransactionManager transactions;
    @Autowired EntityManager em;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper json;
    @LocalServerPort int port;
    Actor admin, traveler;
    String offering;
    Map<String,Object> card;
    final Instant first = Instant.parse("2026-06-01T03:00:00Z");
    final Instant second = Instant.parse("2026-06-02T03:00:00Z");

    @BeforeEach void fixture() {
        clock.now = Instant.parse("2026-01-01T00:00:00Z");
        admin = user("ADMIN"); traveler = user("USER");
        card = service.provisionBank(admin, new BankInput(traveler.id(),1000,12,2027), key());
        service.linkBank(traveler,new BankLinkInput((String)card.get("bankName"),(String)card.get("cardId"),(String)card.get("testCvv")));
        offering = (String)service.saveOffer(admin,new OfferInput(null,"TOUR",null,"Synthetic audit tour",true,
                new Policy(24,24,30,10,null),null,null,
                List.of(new Departure(first,1,List.of("1"),100),new Departure(second,1,List.of("1"),160)),null)).get("id");
        service.publishCalendar(admin,new CalendarInput(2026,"Synthetic calendar only",Set.of(LocalDate.of(2026,6,2)),true));
    }
    String key() { return UUID.randomUUID().toString(); }
    Actor user(String role) {
        User u = new User(); u.setEmail(key()+"@example.test"); u.setPassword("synthetic-fixture"); u.setRole(role); u.setStatus("active"); u.setName("Synthetic audit traveler");
        return new Actor(users.saveAndFlush(u).getId(),role);
    }
    Map<String,Object> review(Actor actor, Instant departure, Map<String,Object> current) {
        return service.review(actor,new ReviewInput(offering,current==null?null:(String)current.get("id"),
                current==null?null:((Number)current.get("revision")).longValue(),departure,null,null,1,List.of("1"),null,null),key());
    }
    Map<String,Object> pay(Map<String,Object> review) {
        return service.pay(traveler,(String)review.get("id"),new PayInput((String)review.get("digest"),true,(String)card.get("cardId"),(String)card.get("testCvv")),key());
    }
    long balance() { return ((Number)service.bank(traveler).get("balance")).longValue(); }
    long count(String table,String booking,String condition) {
        return jdbc.queryForObject("select count(*) from "+table+" where "+(table.equals("notifications")?"target_reference":"reservation_id")+"=? and "+condition,Long.class,booking);
    }
    void singleRefund(String id,long refund,long fee,long expectedBalance) {
        assertEquals(expectedBalance,balance());
        assertEquals(1,count("simulated_transactions",id,"kind='REFUND'"));
        assertEquals(refund,jdbc.queryForObject("select amount from simulated_transactions where reservation_id=? and kind='REFUND'",Long.class,id));
        assertEquals(1,count("simulated_transactions",id,"kind='CANCELLATION_FEE'"));
        assertEquals(fee,jdbc.queryForObject("select amount from simulated_transactions where reservation_id=? and kind='CANCELLATION_FEE'",Long.class,id));
        assertEquals(0,count("booking_allocations",id,"status='CONFIRMED'"));
        assertEquals(1,count("notifications",id,"type='BOOKING_CANCELLED'"));
        assertEquals(1,service.history(traveler,id).stream().filter(event->"CANCELLED".equals(event.get("action"))).count());
    }
    String bearer(Actor actor) {
        return "Bearer "+sessions.login(users.findById(actor.id()).orElseThrow().getEmail(),"synthetic-fixture").get("token");
    }

    @Test void tourRefund65PercentIsCreditedExactlyOnceAndSeatResells() {
        var booked=pay(review(traveler,first,null)); String id=(String)booked.get("id"); String operation=key();
        assertEquals("CONFIRMED",booked.get("status")); assertEquals(900,balance());
        var cancelled=service.cancel(traveler,id,new CancelInput("VOLUNTARY"),operation);
        assertEquals(65L,((Number)cancelled.get("refund")).longValue());
        assertEquals(65L,((Number)service.cancel(traveler,id,new CancelInput("VOLUNTARY"),operation).get("refund")).longValue());
        assertThrows(ResponseStatusException.class,()->service.cancel(traveler,id,new CancelInput("VOLUNTARY"),key()));
        singleRefund(id,65,35,965);
        assertNotNull(review(user("USER"),first,null).get("id"));
    }
    @Test void hotelChargesTwoNightsRefunds65PercentAndReleasesTheSameRoom() {
        offering=(String)service.saveOffer(admin,new OfferInput(null,"HOTEL",null,"Synthetic audit hotel",true,
                new Policy(24,24,30,10,null),LocalTime.of(14,0),LocalTime.of(12,0),List.of(),
                List.of(new Room("R1","101",2,100,Map.of())))).get("id");
        ReviewInput stay=new ReviewInput(offering,null,null,null,LocalDate.of(2026,6,1),LocalDate.of(2026,6,3),1,List.of(),Map.of("R1",1),Map.of());
        var booked=pay(service.review(traveler,stay,key())); String id=(String)booked.get("id");
        assertEquals("CONFIRMED",booked.get("status")); assertEquals(800,balance());
        Actor other=user("USER"); assertThrows(ResponseStatusException.class,()->service.review(other,stay,key()));
        service.cancel(traveler,id,new CancelInput("VOLUNTARY"),key()); singleRefund(id,130,70,930);
        assertNotNull(service.review(other,stay,key()).get("id"));
    }
    @Test void administratorRefundsAllOriginalAndReschedulingChargesWithoutResellingUnavailableService() throws Exception {
        var booked=pay(review(traveler,first,null)); var changed=pay(review(traveler,second,booked)); String id=(String)changed.get("id");
        assertEquals(820,balance());
        String definition=jdbc.queryForObject("select definition from booking_offerings where id=?",String.class,offering);
        clock.now=second.minus(Duration.ofHours(1)); // Admin cancellation remains valid after the voluntary cutoff.
        var cancelled=service.cancel(admin,id,new CancelInput("SERVICE_UNAVAILABLE"),key());
        assertEquals(180L,((Number)cancelled.get("basis")).longValue()); singleRefund(id,180,0,1000);
        assertFalse(jdbc.queryForObject("select active from booking_offerings where id=?",Boolean.class,offering));
        assertTrue(service.offers().stream().noneMatch(o->offering.equals(o.get("id"))));
        assertThrows(RuntimeException.class,()->review(user("USER"),second,null));
        assertEquals(definition,jdbc.queryForObject("select definition from booking_offerings where id=?",String.class,offering),"Read projection must not rewrite the saved offering definition");
        String response=mvc.perform(get("/api/booking/admin/offers").header("Authorization",bearer(admin))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        boolean found=false;
        for(var item:json.readTree(response)) if(offering.equals(item.path("id").asText())) { found=true; assertFalse(item.path("active").asBoolean(),"Admin HTTP projection must match entity state"); }
        assertTrue(found);
        var audit=json.valueToTree(service.history(traveler,id).stream().filter(h->"CANCELLED".equals(h.get("action"))).findFirst().orElseThrow().get("details"));
        assertFalse(audit.path("cutoffEvaluation").path("applicable").asBoolean(true));
        assertTrue(audit.path("cutoffEvaluation").path("eligible").asBoolean());
        assertFalse((Boolean)service.adminOffers(admin).stream().filter(o->offering.equals(o.get("id"))).findFirst().orElseThrow().get("active"));
    }
    @Test void refundStillCreditsSourceAfterExpiryLockSuspensionOrClosure() {
        for(String status:List.of("ACTIVE","LOCKED","SUSPENDED","CLOSED")) {
            if(!status.equals("ACTIVE")) fixture();
            var booked=pay(review(traveler,first,null)); String id=(String)booked.get("id");
            jdbc.update("update simulated_cards set status=?,expiry_year=2025 where account_id=?",status,card.get("accountId"));
            service.cancel(traveler,id,new CancelInput("VOLUNTARY"),key()); singleRefund(id,65,35,965);
            assertEquals(card.get("accountId"),jdbc.queryForObject("select account_id from simulated_transactions where reservation_id=? and kind='REFUND'",String.class,id));
        }
    }
    @Test void cancellationEnforcesOwnerRoleCutoffAndUnchangedBalance() throws Exception {
        String id=(String)pay(review(traveler,first,null)).get("id"); Actor other=user("USER");
        mvc.perform(post("/api/booking/bookings/"+id+"/cancel").header("Authorization",bearer(other)).header("Idempotency-Key",key()).contentType("application/json").content("{\"reason\":\"VOLUNTARY\"}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/booking/bookings/"+id+"/cancel").header("Authorization",bearer(traveler)).header("Idempotency-Key",key()).contentType("application/json").content("{\"reason\":\"SERVICE_UNAVAILABLE\"}")).andExpect(status().isForbidden());
        clock.now=first.minus(Duration.ofHours(24));
        assertThrows(ResponseStatusException.class,()->service.cancel(traveler,id,new CancelInput("VOLUNTARY"),key()));
        assertEquals(900,balance()); assertEquals(0,count("simulated_transactions",id,"kind='REFUND'"));
        assertEquals(1,count("booking_allocations",id,"status='CONFIRMED'"));
    }
    List<Map<String,Object>> race(String id,boolean adminRace) throws Exception {
        try(ExecutorService pool=Executors.newFixedThreadPool(2)) {
            CountDownLatch start=new CountDownLatch(1); List<Future<Map<String,Object>>> futures=new ArrayList<>();
            for(int i=0;i<2;i++) { Actor actor=adminRace&&i==1?admin:traveler; String reason=actor.admin()?"SERVICE_UNAVAILABLE":"VOLUNTARY";
                futures.add(pool.submit(()->{start.await();try{return service.cancel(actor,id,new CancelInput(reason),key());}catch(ResponseStatusException expected){return Map.of("error",expected.getStatusCode().value());}})); }
            start.countDown(); List<Map<String,Object>> results=new ArrayList<>(); for(var future:futures)results.add(future.get(15,TimeUnit.SECONDS)); return results;
        }
    }
    @Test void concurrentDifferentKeysCannotRefundOrReleaseTwice() throws Exception {
        String id=(String)pay(review(traveler,first,null)).get("id"); var results=race(id,false);
        assertEquals(1,results.stream().filter(r->r.containsKey("refund")).count()); singleRefund(id,65,35,965);
    }
    @Test void concurrentTravelerAdminCancellationHasOneFinancialOutcome() throws Exception {
        String id=(String)pay(review(traveler,first,null)).get("id"); var result=race(id,true).stream().filter(r->r.containsKey("refund")).toList();
        assertEquals(1,result.size()); long refund=((Number)result.getFirst().get("refund")).longValue();
        assertTrue(refund==65||refund==100); singleRefund(id,refund,100-refund,900+refund);
    }
    @Test void failureAfterFlushedCancellationRollsBackCreditLedgerInventoryHistoryAndNotice() {
        String id=(String)pay(review(traveler,first,null)).get("id"); String operation=key();
        assertThrows(IllegalStateException.class,()->new TransactionTemplate(transactions).execute(status->{
            service.cancel(traveler,id,new CancelInput("VOLUNTARY"),operation); em.flush(); throw new IllegalStateException("Synthetic post-write failure");
        }));
        assertEquals(900,balance()); assertEquals(0,count("simulated_transactions",id,"kind='REFUND'"));
        assertEquals(1,count("booking_allocations",id,"status='CONFIRMED'")); assertEquals(0,count("notifications",id,"type='BOOKING_CANCELLED'"));
        assertEquals(0,service.history(traveler,id).stream().filter(h->"CANCELLED".equals(h.get("action"))).count());
        service.cancel(traveler,id,new CancelInput("VOLUNTARY"),operation); singleRefund(id,65,35,965);
    }
    @Test void cancellationAuditHistoryMustContainContributingChargeReferencesAndEvaluatedCutoff() throws Exception {
        var booked=pay(review(traveler,first,null)); var change=review(traveler,second,booked);
        var failed=service.pay(traveler,(String)change.get("id"),new PayInput((String)change.get("digest"),true,(String)card.get("cardId"),"invalid-synthetic-code"),key());
        assertEquals("FAILED",failed.get("status"));
        var changed=pay(change); String id=(String)changed.get("id");
        service.saveOffer(admin,new OfferInput(offering,"TOUR",null,"Synthetic audit tour",true,new Policy(72,24,30,10,null),null,null,
                List.of(new Departure(first,1,List.of("1"),100),new Departure(second,1,List.of("1"),160)),null));
        String operation=key(); var result=service.cancel(traveler,id,new CancelInput("VOLUNTARY"),operation);
        assertEquals(Set.of("booking","simulation","currency","refund","fee","basis"),result.keySet(),"Existing cancellation envelope must stay unchanged");
        assertEquals(180L,((Number)result.get("basis")).longValue()); singleRefund(id,117,63,937);
        var cancelled=service.history(traveler,id).stream().filter(h->"CANCELLED".equals(h.get("action"))).findFirst().orElseThrow();
        assertEquals(Set.of("reference","action","actorId","createdAt","details","simulation","currency"),cancelled.keySet(),"Existing history envelope must stay unchanged");
        String event=json.writeValueAsString(cancelled);
        var references=jdbc.queryForList("select id from simulated_transactions where reservation_id=? and kind='CHARGE'",String.class,id);
        assertAll("FR027 cancellation evidence",()->assertTrue(references.stream().allMatch(event::contains),"CANCELLED history is missing contributing successful charge references"),
                ()->assertTrue(event.contains(second.minus(Duration.ofHours(24)).toString()),"CANCELLED history is missing evaluated saved cancellation cutoff"));
        var details=json.valueToTree(cancelled.get("details"));
        var payments=details.path("paymentReferences"); assertEquals(2,payments.size(),"Failed attempts must not enter refund evidence");
        long paid=0; Set<String> actualReferences=new HashSet<>();
        for(var payment:payments) { paid+=payment.path("amount").asLong(); actualReferences.add(payment.path("reference").asText()); }
        assertEquals(180,paid); assertEquals(new HashSet<>(references),actualReferences);
        var cutoff=details.path("cutoffEvaluation");
        assertEquals(second.minus(Duration.ofHours(24)).toString(),cutoff.path("deadline").asText());
        assertEquals(24,cutoff.path("hours").asInt(),"Must evaluate saved itinerary policy, not edited offering policy");
        assertEquals(clock.now.toString(),cutoff.path("evaluatedAt").asText()); assertTrue(cutoff.path("eligible").asBoolean());
        assertTrue(cutoff.path("applicable").asBoolean());
        service.cancel(traveler,id,new CancelInput("VOLUNTARY"),operation);
        assertEquals(event,json.writeValueAsString(service.history(traveler,id).stream().filter(h->"CANCELLED".equals(h.get("action"))).findFirst().orElseThrow()),"Retry must preserve the original audit snapshot");
    }
    @Test @EnabledIfEnvironmentVariable(named="TRAVELAI_BUSINESS_UI_TESTS",matches="1")
    void refundNotificationIsPersistedRetrievedDisplayedAndMarkedReadThroughRealApi() throws Exception {
        String id=(String)pay(review(traveler,first,null)).get("id"); service.cancel(traveler,id,new CancelInput("VOLUNTARY"),key());
        var notice=notices.findByUserIdOrderByCreatedAtDesc(traveler.id()).stream().filter(n->"BOOKING_CANCELLED".equals(n.getType())).findFirst().orElseThrow();
        assertEquals("Hoàn SIMULATED 65 VND, phí SIMULATED 35 VND.",notice.getMessage()); assertFalse(notice.getIsRead()); assertEquals(id,notice.getTargetReference());
        String auth=bearer(traveler);
        mvc.perform(get("/api/notifications/"+traveler.id()).header("Authorization",auth)).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString(notice.getMessage())));
        mvc.perform(get("/api/notifications/"+traveler.id()).header("Authorization",bearer(user("USER")))).andExpect(status().isForbidden());
        Path root=Path.of(System.getProperty("user.dir")).getParent();
        Path evidence=Path.of(System.getenv().getOrDefault("TRAVELAI_BUSINESS_EVIDENCE_DIR","/tmp/travelai-business-audit"));
        Files.createDirectories(evidence);
        ProcessBuilder browser=new ProcessBuilder("node",root.resolve("apps/mobile/e2e/backend-cancellation-audit.cjs").toString()).directory(root.toFile())
                .redirectErrorStream(true).redirectOutput(evidence.resolve("browser-runner.log").toFile());
        browser.environment().put("TRAVELAI_AUDIT_API","http://127.0.0.1:"+port);
        browser.environment().put("TRAVELAI_AUDIT_TOKEN",auth.substring(7)); browser.environment().put("TRAVELAI_AUDIT_BOOKING",id);
        Process process=browser.start();
        try { assertTrue(process.waitFor(80,TimeUnit.SECONDS),"Browser acceptance timed out"); assertEquals(0,process.exitValue(),"Actual notification UI/API journey failed"); }
        finally { if(process.isAlive()) { process.descendants().forEach(ProcessHandle::destroy); process.destroyForcibly(); } }
        assertTrue(notices.findById(notice.getId()).orElseThrow().getIsRead(),"Browser read action must persist, not merely change local UI");
    }
}
