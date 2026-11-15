package com.travelai.backend.booking;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.travelai.backend.security.*;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.entity.Notification;
import com.travelai.backend.service.NotificationPublisher;
import jakarta.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.nio.charset.StandardCharsets;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.*;
import java.util.*;
import java.util.function.Supplier;
import static com.travelai.backend.booking.BookingContracts.*;
import static com.travelai.backend.booking.BookingPolicies.*;

@Service
@Transactional
public class BookingService {
    private final NotificationPublisher notifications;
    private final EntityManager em;
    private final ObjectMapper json;
    private final Clock clock;
    private final UserRepository users;

    public BookingService(NotificationPublisher notifications, EntityManager em, ObjectMapper mapper, Clock clock, UserRepository users) {
        this.notifications = notifications;
        this.em=em; this.json=mapper.copy().configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS,true);
        this.clock=clock; this.users=users;
    }
    private void lock() {
        em.createNativeQuery("insert into booking_barrier(id) values (1) on conflict do nothing").executeUpdate();
        em.createNativeQuery("select id from booking_barrier where id=1 for update").getSingleResult();
        // A transaction may have read an entity before waiting on the barrier.
        em.clear();
    }
    private void expire(Instant now) {
        em.createQuery("update InventoryAllocation a set a.status='RELEASED' where a.status='HOLD' and a.expiresAt<=:now")
                .setParameter("now",now).executeUpdate();
        em.createQuery("update BookingReview r set r.status='EXPIRED' where r.status='PENDING' and r.expiresAt<=:now")
                .setParameter("now",now).executeUpdate();
    }
    public Map<String,Object> saveOffer(SessionService.Actor actor, OfferInput input) {
        actor.requireAdmin(); lock(); validateOffer(input);
        BookingOffering offer=input.id()==null?new BookingOffering():find(BookingOffering.class,input.id());
        boolean created = offer.id == null;
        if (created) offer.id=id();
        offer.kind=input.kind(); offer.legacyId=input.legacyId(); offer.active=input.active();
        offer.version=id(); offer.definition=write(input);
        if (created) em.persist(offer);
        notifications.inventoryChanged(offer.id);
        return offerView(offer);
    }
    private void validateOffer(OfferInput o) {
        require(o!=null && Set.of("TOUR","HOTEL").contains(o.kind()),"Offering must be TOUR or HOTEL");
        require(o.name()!=null && !o.name().isBlank(),"Offering name required");
        Policy p=o.policy();
        if (o.promotion()!=null) require(o.promotion().from()!=null && o.promotion().through()!=null && !o.promotion().through().isBefore(o.promotion().from()) && o.promotion().percent()>=1 && o.promotion().percent()<=100,"Invalid promotion date range or percentage");
        require(p!=null && p.cancellationHours()!=null && p.cancellationHours()>=0
                && p.reschedulingHours()!=null && p.reschedulingHours()>=0
                && p.graceMinutes()!=null && p.graceMinutes()>=0
                && p.holdMinutes()!=null && p.holdMinutes()>=1,"Configure all four valid policies before sale");
        require(p.holidayReschedulingHours()==null || p.holidayReschedulingHours()>=0,"Invalid holiday cutoff");
        if (o.kind().equals("TOUR")) {
            require(o.departures()!=null && !o.departures().isEmpty(),"Configure departures");
            Set<Instant> starts=new HashSet<>();
            for (Departure d:o.departures()) {
                require(d.start()!=null && starts.add(d.start()) && d.capacity()>0 && d.price()>=0,"Invalid departure capacity/price/time");
                require(d.end()==null || d.end().isAfter(d.start()),"Tour end must follow departure");
                if (d.seats()!=null && !d.seats().isEmpty())
                    require(new HashSet<>(d.seats()).size()==d.seats().size() && d.seats().size()==d.capacity()
                            && d.seats().stream().allMatch(x->x!=null&&!x.isBlank()),"Seat map must contain capacity distinct seats");
            }
        } else {
            require(o.checkInTime()!=null && o.checkOutTime()!=null,"Configure check-in and checkout hours");
            require(o.rooms()!=null&&!o.rooms().isEmpty(),"Configure physical rooms");
            Set<String> ids=new HashSet<>();
            for(Room r:o.rooms()) {
                require(r.id()!=null&&!r.id().isBlank()&&ids.add(r.id())&&r.number()!=null&&r.maxGuests()>0&&r.price()>=0,"Invalid room identity, capacity or price");
                if(r.nightlyPrices()!=null) require(r.nightlyPrices().values().stream().allMatch(v->v!=null&&v>=0),"Invalid nightly price");
            }
        }
    }
    public Map<String,Object> publishCalendar(SessionService.Actor actor, CalendarInput input) {
        actor.requireAdmin(); lock();
        require(input.year()>=1 && input.year()<9999 && input.source()!=null&&!input.source().isBlank(),"Calendar year and official source required");
        require(input.holidays()!=null && input.holidays().stream().allMatch(d->d!=null&&d.getYear()==input.year()),"Holiday date must belong to calendar year");
        HolidayCalendar c=new HolidayCalendar(); c.id=id(); c.calendarYear=input.year(); c.version=id();
        c.source=input.source(); c.approved=input.approved(); c.approvedBy=actor.id();
        Instant latestPublication = em.createQuery("select max(c.approvedAt) from HolidayCalendar c where c.calendarYear=:year", Instant.class)
                .setParameter("year",input.year()).getSingleResult();
        c.approvedAt=clock.instant();
        if (latestPublication != null && !c.approvedAt.isAfter(latestPublication))
            c.approvedAt=latestPublication.plusNanos(1000);
        c.dates=write(input.holidays()); em.persist(c);
        return Map.of("id",c.id,"year",c.calendarYear,"version",c.version,"approved",c.approved,"source",c.source);
    }
    public List<Map<String,Object>> adminOffers(SessionService.Actor actor) {
        actor.requireAdmin();
        return em.createQuery("select o from BookingOffering o", BookingOffering.class).getResultList().stream().map(this::offerView).toList();
    }
    public List<Map<String,Object>> calendarHistory(SessionService.Actor actor) {
        actor.requireAdmin();
        return em.createQuery("select c from HolidayCalendar c order by c.approvedAt desc", HolidayCalendar.class).getResultList().stream()
                .map(c -> Map.<String,Object>of("id", c.id, "year", c.calendarYear, "version", c.version,
                        "source", c.source, "approved", c.approved, "dates", holidayDates(c))).toList();
    }
    public List<Map<String,Object>> offers() {
        return em.createQuery("select o from BookingOffering o where o.active=true",BookingOffering.class).getResultList().stream().map(this::offerView).toList();
    }
    private Map<String,Object> offerView(BookingOffering offer) {
        Map<String,Object> result=readMap(offer.definition); result.put("id",offer.id); result.put("version",offer.version);
        result.put("simulation","SIMULATED"); result.put("currency","VND"); return result;
    }
    public Map<String,Object> provisionBank(SessionService.Actor actor,BankInput input,String key) {
        actor.requireAdmin(); lock();
        return once(actor,"PROVISION",key,input,()-> {
            require(users.existsById(input.ownerId())&&input.balance()>=0,"Existing owner and nonnegative balance required");
            require(input.expiryMonth()>=1&&input.expiryMonth()<=12&&input.expiryYear()>0&&input.expiryYear()<9999,"Invalid synthetic expiry");
            BankAccount account=accountFor(input.ownerId());
            if(account==null) { account=new BankAccount(); account.id=id(); account.ownerId=input.ownerId(); account.balance=input.balance(); em.persist(account); }
            else require(input.balance()==account.balance,"Provisioning cannot overwrite an existing balance");
            BankCard card=new BankCard(); card.id=id(); card.accountId=account.id; card.syntheticId="SIM-MC-"+id();
            String name=input.bankName()==null?"Ngân hàng Mastercard SIMULATED":input.bankName().trim();
            require(name.endsWith(" SIMULATED") && name.length()<=100,"Bank name must be explicitly SIMULATED");
            String cvv="TEST-"+id(); card.cvvHash=digest(cvv); card.bankName=name; card.linked=false; card.expiryMonth=input.expiryMonth(); card.expiryYear=input.expiryYear(); card.status="ACTIVE"; em.persist(card);
            // Synthetic test credential is returned only at provisioning, not written to operation/history.
            return Map.of("simulation","SIMULATED","currency","VND","accountId",account.id,"balance",account.balance,
                    "cardId",card.syntheticId,"bankName",card.bankName,"testCvv",cvv,"expiryMonth",card.expiryMonth,"expiryYear",card.expiryYear);
        },true);
    }
    public Map<String,Object> bank(SessionService.Actor actor) {
        BankAccount a=accountFor(actor.id());
        List<Map<String,Object>> attempts=em.createQuery("select p from PaymentAttempt p where p.ownerId=:owner order by p.createdAt desc,p.id desc",PaymentAttempt.class)
                .setParameter("owner",actor.id()).setMaxResults(100).getResultList().stream().map(p->{ Map<String,Object> v=new LinkedHashMap<>(); v.put("id",p.id); v.put("reviewId",p.reviewId); v.put("bookingId",p.reservationId); v.put("status",p.status); v.put("reason",p.reason); v.put("amount",p.amount); v.put("createdAt",p.createdAt); return v; }).toList();
        if(a==null) return Map.of("simulation","SIMULATED","currency","VND","balance",0,"cards",List.of(),"transactions",List.of(),"paymentAttempts",attempts);
        List<Map<String,Object>> cards=em.createQuery("select c from BankCard c where c.accountId=:id and c.linked=true",BankCard.class).setParameter("id",a.id).getResultList().stream()
                .map(c->Map.<String,Object>of("cardId",c.syntheticId,"bankName",c.bankName,"status",c.status,"expiryMonth",c.expiryMonth,"expiryYear",c.expiryYear)).toList();
        List<Map<String,Object>> tx=em.createQuery("select t from BankTransaction t where t.accountId=:id order by t.createdAt",BankTransaction.class)
                .setParameter("id",a.id).getResultList().stream().map(t->Map.<String,Object>of("reference",t.id,"bookingId",t.reservationId,"kind",t.kind,"amount",t.amount,"createdAt",t.createdAt)).toList();
        return Map.of("simulation","SIMULATED","currency","VND","accountId",a.id,"balance",a.balance,"cards",cards,"transactions",tx,"paymentAttempts",attempts);
    }
    public Map<String,Object> linkBank(SessionService.Actor actor,BankLinkInput input) {
        lock();
        if(input==null || input.accountNumber()==null || !input.accountNumber().startsWith("SIM-MC-") || input.testCvv()==null || !input.testCvv().startsWith("TEST-") || input.testCvv().length()>200 || input.bankName()==null || input.bankName().length()>255) throw bad("Chỉ chấp nhận số tài khoản SIM-MC-… và mã TEST-… SIMULATED.");
        BankCard c=card(input.accountNumber());
        BankAccount a=c==null?null:em.find(BankAccount.class,c.accountId);
        if(c==null || a==null || a.ownerId!=actor.id() || !Objects.equals(c.bankName,input.bankName()) || c.cvvHash==null || !MessageDigest.isEqual(digest(input.testCvv()).getBytes(StandardCharsets.UTF_8),c.cvvHash.getBytes(StandardCharsets.UTF_8)) || !cardPayable(clock.instant(),c.expiryMonth,c.expiryYear,c.status))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Thông tin ngân hàng SIMULATED không hợp lệ hoặc không thuộc tài khoản của bạn.");
        c.linked=true;
        return Map.of("status","LINKED","bankName",c.bankName,"cardId",c.syntheticId,"simulation","SIMULATED");
    }
    public List<String> institutions() {
        return em.createQuery("select distinct c.bankName from BankCard c order by c.bankName",String.class).getResultList();
    }
    public Map<String,Object> cardStatus(SessionService.Actor actor,String syntheticId,String status) {
        actor.requireAdmin(); lock(); require(Set.of("ACTIVE","LOCKED","SUSPENDED","CLOSED").contains(status),"Invalid card status");
        BankCard card=card(syntheticId); require(card!=null,"Unknown synthetic card"); card.status=status;
        return Map.of("simulation","SIMULATED","cardId",card.syntheticId,"status",card.status);
    }
    public Map<String,Object> review(SessionService.Actor actor,ReviewInput input,String key) {
        lock(); Instant now=clock.instant(); expire(now);
        return once(actor,"REVIEW",key,input,()-> {
            Reservation current=input.bookingId()==null?null:owned(actor,input.bookingId());
            if(current!=null) { requireStatus(current,"CONFIRMED"); conflict(input.bookingRevision()!=null&&current.revision==input.bookingRevision(),"Booking changed; reload before reviewing"); }
            BookingOffering offer=find(BookingOffering.class,input.offeringId()); require(offer.active,"Service is unavailable");
            if(current!=null) require(current.offeringId.equals(offer.id),"Rescheduling stays within the same tour or hotel");
            Itinerary target=itinerary(offer,input,now);
            Quote quote=quote(target,current,current!=null);
            checkCutoffs(now,current,target);
            supersede(actor,input);
            availability(target.resources(),current==null?null:current.id,now);
            BookingReview r=new BookingReview(); r.id=id(); r.ownerId=actor.id(); r.reservationId=current==null?null:current.id;
            r.reservationRevision=current==null?0:current.revision; r.status="PENDING"; r.createdAt=now;
            r.expiresAt=now.plusSeconds(Math.multiplyExact(target.policy().holdMinutes().longValue(),60));
            r.quote=write(quote); r.digest=digest(r.quote); em.persist(r);
            Set<String> oldKeys=current==null?Set.of():resourceKeys(read(current.itinerary,Itinerary.class).resources());
            for(Resource resource:target.resources()) if(!oldKeys.contains(resource.key())) {
                InventoryAllocation a=new InventoryAllocation(); a.id=id(); a.reviewId=r.id; a.resourceKey=resource.key(); a.quantity=resource.quantity();
                a.serviceStart=resource.start(); a.status="HOLD"; a.expiresAt=r.expiresAt; em.persist(a);
            }
            notifications.inventoryChanged(offer.id);
            return reviewView(r);
        });
    }
    private Itinerary itinerary(BookingOffering entity,ReviewInput input,Instant now) {
        OfferInput o=read(entity.definition,OfferInput.class); require(input.guests()>0,"Positive guest count required");
        List<Resource> resources=new ArrayList<>(); Map<String,List<Long>> prices=new TreeMap<>();
        Instant start,end; long amount=0;
        if(o.kind().equals("TOUR")) {
            Departure d=o.departures().stream().filter(x->x.start().equals(input.departure())).findFirst().orElseThrow(()->bad("Unknown departure"));
            start=d.start(); end=d.end()==null ? start : d.end();
            if(d.seats()!=null&&!d.seats().isEmpty()) {
                require(input.seats()!=null&&input.seats().size()==input.guests()&&new HashSet<>(input.seats()).size()==input.guests(),"Choose one distinct seat per traveler");
                for(String seat:input.seats()) { require(d.seats().contains(seat),"Seat does not belong to departure"); resources.add(new Resource(entity.id+"|T|"+start+"|"+seat,1,1,start)); }
            } else resources.add(new Resource(entity.id+"|T|"+start,input.guests(),d.capacity(),start));
            amount=Math.multiplyExact(discounted(d.price(),o.promotion(),start.atZone(VIETNAM).toLocalDate()),input.guests());
        } else {
            List<LocalDate> dates=nights(input.checkIn(),input.checkOut());
            start=input.checkIn().atTime(o.checkInTime()).atZone(VIETNAM).toInstant(); end=input.checkOut().atTime(o.checkOutTime()).atZone(VIETNAM).toInstant();
            require(input.roomGuests()!=null&&!input.roomGuests().isEmpty(),"Select physical rooms");
            long assigned=0;
            for(var selected:input.roomGuests().entrySet()) {
                Room room=o.rooms().stream().filter(x->x.id().equals(selected.getKey())).findFirst().orElseThrow(()->bad("Unknown physical room"));
                require(selected.getValue()!=null&&selected.getValue()>=0&&selected.getValue()<=room.maxGuests(),"Room guest capacity exceeded");
                assigned=Math.addExact(assigned,selected.getValue()); List<Long> nightly=new ArrayList<>();
                for(LocalDate date:dates) {
                    long price=room.nightlyPrices()==null?room.price():room.nightlyPrices().getOrDefault(date,room.price());
                    price=discounted(price,o.promotion(),date);
                    nightly.add(price); amount=Math.addExact(amount,price);
                    resources.add(new Resource(entity.id+"|R|"+room.id()+"|"+date,1,1,date.atTime(o.checkInTime()).atZone(VIETNAM).toInstant()));
                }
                prices.put(room.id(),nightly);
            }
            require(assigned==input.guests(),"Room assignments must equal the unchanged total guests");
        }
        require(start.isAfter(now),"Service start must be in the future");
        int hours=o.policy().reschedulingHours();
        HolidayCalendar c=calendar(start.atZone(VIETNAM).getYear());
        if(o.policy().holidayReschedulingHours()!=null&&c!=null&&holidayDates(c).contains(start.atZone(VIETNAM).toLocalDate())) hours=o.policy().holidayReschedulingHours();
        return new Itinerary(input,entity.version,o.name(),o.kind(),start,end,VIETNAM.getId(),o.policy(),prices,resources,amount,hours);
    }
    private long discounted(long price,Promotion promotion,LocalDate serviceDate) {
        if (promotion==null || serviceDate.isBefore(promotion.from()) || serviceDate.isAfter(promotion.through())) return price;
        return BigInteger.valueOf(price).multiply(BigInteger.valueOf(100L-promotion.percent())).add(BigInteger.valueOf(50)).divide(BigInteger.valueOf(100)).longValueExact();
    }
    private Quote quote(Itinerary target,Reservation current,boolean requireCalendar) {
        Itinerary old=current==null?null:read(current.itinerary,Itinerary.class);
        if(old!=null) require(old.selection().guests()==target.selection().guests(),"Rescheduling must preserve total guests");
        Map<Integer,String> versions=new TreeMap<>(); Set<LocalDate> holidays=new HashSet<>();
        Set<Integer> years=new TreeSet<>();
        if(target.kind().equals("TOUR")) years.add(target.start().atZone(VIETNAM).getYear());
        else for(LocalDate date:nights(target.selection().checkIn(),target.selection().checkOut())) years.add(date.getYear());
        for(int year:years) {
            HolidayCalendar c=calendar(year);
            if(c==null) { conflict(!requireCalendar,"Approved Vietnamese holiday calendar required for year "+year); }
            else { versions.put(year,c.version); holidays.addAll(holidayDates(c)); }
        }
        long difference=0; List<NightCharge> charges=new ArrayList<>();
        if(old!=null&&target.kind().equals("TOUR")) {
            if(holidays.contains(target.start().atZone(VIETNAM).toLocalDate())) difference=Math.max(0,target.itineraryPrice()-old.itineraryPrice());
        } else if(target.kind().equals("HOTEL")) {
            Map<String,String> pairs=target.selection().replacementRooms()==null?Map.of():target.selection().replacementRooms();
            Set<String> usedOld=new HashSet<>();
            for(var pair:pairs.entrySet()) {
                require(old!=null&&target.roomPrices().containsKey(pair.getKey())&&old.roomPrices().containsKey(pair.getValue())&&usedOld.add(pair.getValue()),"Invalid or duplicate old/new room mapping");
            }
            List<LocalDate> dates=nights(target.selection().checkIn(),target.selection().checkOut());
            for(var room:target.roomPrices().entrySet()) {
                List<Long> baseline=old!=null&&pairs.containsKey(room.getKey())?old.roomPrices().get(pairs.get(room.getKey())):List.of();
                for(int i=0;i<dates.size();i++) {
                    boolean holiday=holidays.contains(dates.get(i)); Long prior=i<baseline.size()?baseline.get(i):null;
                    long extra=old!=null&&holiday?Math.max(0,room.getValue().get(i)-(prior==null?0:prior)):0;
                    difference=Math.addExact(difference,extra);
                    charges.add(new NightCharge(room.getKey(),dates.get(i),prior,room.getValue().get(i),holiday,extra,old!=null&&prior==null));
                }
            }
        }
        long original=current==null?target.itineraryPrice():current.originalAmount;
        long fee=current==null?0:reschedulingFee(original);
        long total=current==null?target.itineraryPrice():Math.addExact(fee,difference);
        return new Quote(target,original,fee,difference,total,charges,holidays.contains(target.start().atZone(VIETNAM).toLocalDate()),versions);
    }
    private void checkCutoffs(Instant now,Reservation current,Itinerary target) {
        if(current==null) return;
        Itinerary old=read(current.itinerary,Itinerary.class);
        conflict(now.isBefore(cutoff(old.start(),old.changeHours())),"Current itinerary rescheduling deadline reached");
        conflict(now.isBefore(cutoff(target.start(),target.changeHours())),"Proposed itinerary rescheduling deadline reached");
    }
    public Map<String,Object> pay(SessionService.Actor actor,String reviewId,PayInput input,String key) {
        lock(); Instant now=clock.instant(); expire(now);
        // Payment credentials are never included in persisted operation payloads.
        Map<String,Object> payload=Map.of("review",reviewId,"digest",Objects.toString(input.digest(),""),"confirmed",input.confirmed(),"card",Objects.toString(input.cardId(),""));
        return once(actor,"PAY",key,payload,()-> {
            BookingReview review=find(BookingReview.class,reviewId); actor.requireOwner(review.ownerId);
            conflict(review.ownerId==actor.id(),"Only the traveler may confirm payment");
            conflict(review.status.equals("PENDING")&&now.isBefore(review.expiresAt),"Hold expired or already completed");
            require(input.confirmed()&&Objects.equals(review.digest,input.digest()),"Explicit confirmation of the exact review is required");
            Reservation current=review.reservationId==null?null:owned(actor,review.reservationId);
            if(current!=null) { requireStatus(current,"CONFIRMED"); conflict(current.revision==review.reservationRevision,"Booking changed; create a fresh review"); }
            Quote quoted=read(review.quote,Quote.class); Itinerary target=quoted.itinerary();
            BookingOffering liveOffer=find(BookingOffering.class,target.selection().offeringId()); require(liveOffer.active,"Service cannot be provided");
            checkCutoffs(now,current,target); require(target.start().isAfter(now),"Service has started");
            Quote latest=quote(target,current,current!=null);
            conflict(quoted.total()==latest.total()&&write(quoted.nights()).equals(write(latest.nights()))
                    &&tourClassificationEquivalent(quoted,latest),"Holiday classification or payment changed; review and confirm again");
            availability(target.resources(),current==null?null:current.id,now,review.id);
            BankCard card=card(input.cardId());
            if(card==null||!card.linked||input.testCvv()==null||card.cvvHash==null||!MessageDigest.isEqual(digest(input.testCvv()).getBytes(StandardCharsets.UTF_8),card.cvvHash.getBytes(StandardCharsets.UTF_8))
                    ||!cardPayable(now,card.expiryMonth,card.expiryYear,card.status)) return decline(actor,review,latest.total(),"Thông tin ngân hàng SIMULATED không hợp lệ.",key,now);
            BankAccount account=find(BankAccount.class,card.accountId);
            if(account.ownerId!=actor.id()) return decline(actor,review,latest.total(),"Thông tin ngân hàng SIMULATED không hợp lệ.",key,now);
            if(current!=null&&!account.id.equals(current.sourceAccountId)) return decline(actor,review,latest.total(),"Dùng tài khoản SIMULATED đã thanh toán ban đầu.",key,now);
            if(account.balance<latest.total()) return decline(actor,review,latest.total(),"Số dư SIMULATED không đủ.",key,now);
            Reservation booking=current;
            if(booking==null) { booking=new Reservation(); booking.id=id(); booking.ownerId=actor.id(); booking.offeringId=liveOffer.id;
                booking.sourceAccountId=account.id; booking.originalAmount=latest.originalAmount(); booking.totalPaid=0; booking.createdAt=now; }
            account.balance=Math.subtractExact(account.balance,latest.total()); booking.totalPaid=Math.addExact(booking.totalPaid,latest.total());
            booking.status="CONFIRMED"; booking.revision++; booking.itinerary=write(target);
            if (current == null) em.persist(booking);
            em.createQuery("update InventoryAllocation a set a.status='RELEASED' where a.reservationId=:id and a.status='CONFIRMED'").setParameter("id",booking.id).executeUpdate();
            releaseReview(review.id);
            for(Resource resource:target.resources()) { InventoryAllocation a=new InventoryAllocation(); a.id=id(); a.reservationId=booking.id;
                a.resourceKey=resource.key(); a.quantity=resource.quantity(); a.serviceStart=resource.start(); a.status="CONFIRMED"; em.persist(a); }
            review.status="PAID"; review.reservationId=booking.id;
            ledger(account.id,booking.id,"CHARGE",latest.total(),operationId(actor,"PAY",key),now);
            paymentAttempt(actor,review,booking,"SUCCEEDED","Thanh toán SIMULATED thành công.",latest.total(),key,now);
            history(actor,booking,current==null?"CONFIRMED":"RESCHEDULED",Map.of("reviewId",review.id,"reviewed",quoted,"validated",latest,"sourceAccountId",account.id),operationId(actor,"PAY",key),now);
            if (current != null) notifications.supersedeReminders(booking.id);
            notifications.inventoryChanged(booking.offeringId);
            notifyBooking(booking, current == null ? "BOOKING_CONFIRMED" : "BOOKING_RESCHEDULED",
                    current == null ? "Đặt chỗ đã được xác nhận" : "Đổi lịch thành công",
                    "Lịch trình " + target.name() + " đã được xác nhận. Thanh toán SIMULATED đã được ghi nhận.", now);
            return bookingView(booking);
        });
    }
    private boolean tourClassificationEquivalent(Quote a,Quote b) {
        if(!a.itinerary().kind().equals("TOUR")) return true;
        LocalDate date=a.itinerary().start().atZone(VIETNAM).toLocalDate();
        // Preserve classification evidence even when the positive price delta is zero.
        return holidayForVersion(a.calendarVersions().get(date.getYear()),date)==holidayForVersion(b.calendarVersions().get(date.getYear()),date);
    }
    private boolean holidayForVersion(String version,LocalDate date) {
        if(version==null) return false;
        return em.createQuery("select c from HolidayCalendar c where c.version=:v",HolidayCalendar.class).setParameter("v",version)
                .getResultStream().findFirst().map(c->holidayDates(c).contains(date)).orElse(false);
    }
    public Map<String,Object> cancel(SessionService.Actor actor,String id,CancelInput input,String key) {
        lock(); Instant now=clock.instant(); expire(now);
        return once(actor,"CANCEL",key,Map.of("booking",id,"reason",Objects.toString(input.reason(),"")),()-> {
            Reservation booking=owned(actor,id); requireStatus(booking,"CONFIRMED"); Itinerary itinerary=read(booking.itinerary,Itinerary.class);
            boolean serviceUnavailable="SERVICE_UNAVAILABLE".equals(input.reason());
            if(serviceUnavailable) actor.requireAdmin(); else {
                conflict(actor.id()==booking.ownerId,"Only the booking owner may voluntarily cancel");
                conflict(now.isBefore(cutoff(itinerary.start(),itinerary.policy().cancellationHours())),"Cancellation deadline reached");
            }
            long paid=em.createQuery("select coalesce(sum(t.amount),0) from BankTransaction t where t.reservationId=:id and t.kind='CHARGE'",Long.class).setParameter("id",id).getSingleResult();
            require(paid==booking.totalPaid,"Payment ledger does not reconcile");
            long refund=serviceUnavailable?paid:voluntaryRefund(paid); long fee=paid-refund;
            BankAccount account=find(BankAccount.class,booking.sourceAccountId); account.balance=Math.addExact(account.balance,refund);
            booking.status="CANCELLED"; booking.revision++;
            List<InventoryAllocation> allocations=allocations(id);
            for(InventoryAllocation a:allocations) if(a.status.equals("CONFIRMED")&&a.serviceStart.isAfter(now)) a.status="RELEASED";
            // Service-unavailable offerings cannot be resold merely by releasing a booking allocation.
            if(serviceUnavailable) find(BookingOffering.class,booking.offeringId).active=false;
            ledger(account.id,id,"REFUND",refund,operationId(actor,"CANCEL",key),now);
            ledger(account.id,id,"CANCELLATION_FEE",fee,operationId(actor,"CANCEL",key),now);
            history(actor,booking,"CANCELLED",Map.of("reason",serviceUnavailable?"SERVICE_UNAVAILABLE":"TRAVELER","basis",paid,"refund",refund,"fee",fee,"sourceAccountId",account.id),operationId(actor,"CANCEL",key),now);
            notifications.supersedeReminders(booking.id);
            notifications.inventoryChanged(booking.offeringId);
            notifyBooking(booking, "BOOKING_CANCELLED", "Đặt chỗ đã được hủy",
                    "Hoàn SIMULATED " + refund + " VND, phí SIMULATED " + fee + " VND.", now);
            return Map.of("booking",bookingView(booking),"simulation","SIMULATED","currency","VND","refund",refund,"fee",fee,"basis",paid);
        });
    }
    public Map<String,Object> noShow(SessionService.Actor actor,String id,NoShowInput input,String key) {
        actor.requireAdmin(); lock(); Instant now=clock.instant(); expire(now);
        return once(actor,"NO_SHOW",key,Map.of("booking",id,"input",input),()-> {
            require(input.reason()!=null&&!input.reason().isBlank(),"No-show reason required");
            Reservation booking=find(Reservation.class,id); requireStatus(booking,"CONFIRMED"); Itinerary i=read(booking.itinerary,Itinerary.class);
            conflict(noShowEligible(now,i.start(),i.policy().graceMinutes()),"No-show grace period has not elapsed");
            Set<String> release=input.releaseResources()==null?Set.of():input.releaseResources(); List<InventoryAllocation> all=allocations(id);
            for(String resource:release) {
                InventoryAllocation a=all.stream().filter(x->x.status.equals("CONFIRMED")&&x.resourceKey.equals(resource)).findFirst().orElseThrow(()->bad("Unknown original allocation"));
                conflict(a.serviceStart.isAfter(now)&&find(BookingOffering.class,booking.offeringId).active,"Only resellable future allocations may be released"); a.status="RELEASED";
            }
            booking.status="NO_SHOW"; booking.revision++;
            history(actor,booking,"NO_SHOW",Map.of("reason",input.reason(),"released",release,"refund",0,"graceMinutes",i.policy().graceMinutes()),operationId(actor,"NO_SHOW",key),now);
            notifications.supersedeReminders(booking.id);
            notifications.inventoryChanged(booking.offeringId);
            notifyBooking(booking, "BOOKING_NO_SHOW", "Cập nhật trạng thái đặt chỗ", "Đặt chỗ được ghi nhận vắng mặt. Hoàn SIMULATED 0 VND.", now);
            return bookingView(booking);
        });
    }
    public Map<String,Object> correctNoShow(SessionService.Actor actor,String id,String reason,String key) {
        actor.requireAdmin(); lock(); Instant now=clock.instant(); expire(now);
        return once(actor,"CORRECT_NO_SHOW",key,Map.of("booking",id,"reason",Objects.toString(reason,"")),()-> {
            require(reason!=null&&!reason.isBlank(),"Correction reason required"); Reservation b=find(Reservation.class,id); requireStatus(b,"NO_SHOW");
            Itinerary i=read(b.itinerary,Itinerary.class); availability(i.resources(),id,now);
            em.createQuery("update InventoryAllocation a set a.status='RELEASED' where a.reservationId=:id and a.status='CONFIRMED'").setParameter("id",id).executeUpdate();
            for(Resource resource:i.resources()) { InventoryAllocation a=new InventoryAllocation(); a.id=id(); a.reservationId=id; a.resourceKey=resource.key();
                a.quantity=resource.quantity(); a.serviceStart=resource.start(); a.status="CONFIRMED"; em.persist(a); }
            b.status="CONFIRMED"; b.revision++;
            history(actor,b,"NO_SHOW_CORRECTED",Map.of("reason",reason,"additionalPayment",0),operationId(actor,"CORRECT_NO_SHOW",key),now);
            notifications.inventoryChanged(b.offeringId);
            notifyBooking(b, "BOOKING_CORRECTED", "Đặt chỗ đã được khôi phục", "Lịch trình và chỗ đã được xác nhận lại.", now);
            return bookingView(b);
        });
    }
    private void notifyBooking(Reservation booking, String type, String title, String message, Instant now) {
        notifications.save(Notification.builder().userId(booking.ownerId).actorName("TravelAI")
                .type(type).title(title).message(message).targetReference(booking.id)
                .isRead(false).createdAt(LocalDateTime.ofInstant(now, VIETNAM)).build());
    }

    public void sendDueReminders() {
        lock();
        Instant now = clock.instant();
        List<Reservation> bookings = em.createQuery("select b from Reservation b where b.status='CONFIRMED'", Reservation.class).getResultList();
        for (Reservation booking : bookings) {
            Itinerary itinerary = read(booking.itinerary, Itinerary.class);
            if (!now.isBefore(itinerary.start())) continue;
            Instant acceptedAt = em.createQuery("select max(h.createdAt) from ReservationHistory h where h.reservationId=:id and h.action in ('CONFIRMED','RESCHEDULED','NO_SHOW_CORRECTED')", Instant.class)
                    .setParameter("id", booking.id).getSingleResult();
            if (acceptedAt == null) acceptedAt = booking.createdAt;
            for (int hours : new int[]{24, 1}) {
                Instant due = itinerary.start().minus(Duration.ofHours(hours));
                if (now.isBefore(due) || acceptedAt == null || acceptedAt.isAfter(due)) continue;
                SessionService.Actor owner = new SessionService.Actor(booking.ownerId, "USER");
                once(owner, "REMINDER", booking.id + ":" + booking.revision + ":" + hours,
                        Map.of("booking", booking.id, "revision", booking.revision, "hours", hours), () -> {
                            notifyBooking(booking, "REMINDER_" + hours + "H", "Sắp đến lịch trình của bạn",
                                    itinerary.name() + " sẽ bắt đầu sau " + hours + " giờ.", now);
                            return Map.of("sent", true);
                        });
            }
        }
    }

    public List<Map<String,Object>> bookings(SessionService.Actor actor) {
        List<Reservation> list=actor.admin()?em.createQuery("select b from Reservation b order by b.createdAt desc",Reservation.class).getResultList()
                :em.createQuery("select b from Reservation b where b.ownerId=:owner order by b.createdAt desc",Reservation.class).setParameter("owner",actor.id()).getResultList();
        return list.stream().map(this::bookingView).toList();
    }
    public List<Map<String,Object>> history(SessionService.Actor actor,String id) {
        owned(actor,id);
        return em.createQuery("select h from ReservationHistory h where h.reservationId=:id order by h.createdAt,h.id",ReservationHistory.class).setParameter("id",id).getResultList()
                .stream().map(h->Map.<String,Object>of("reference",h.id,"action",h.action,"actorId",h.actorId,"createdAt",h.createdAt,"details",readMap(h.details),"simulation","SIMULATED","currency","VND")).toList();
    }
    public Map<String,Object> getReview(SessionService.Actor actor, String id) {
        BookingReview review = find(BookingReview.class, id);
        actor.requireOwner(review.ownerId);
        Map<String,Object> result = new LinkedHashMap<>(reviewView(review));
        if (review.status.equals("PENDING") && !clock.instant().isBefore(review.expiresAt)) result.put("status", "EXPIRED");
        if (review.reservationId != null) {
            Reservation original = owned(actor, review.reservationId);
            result.put("originalItinerary", read(original.itinerary, Itinerary.class));
            result.put("sourceAccountId", original.sourceAccountId);
            if (review.status.equals("PAID")) result.put("booking", bookingView(original));
        }
        return result;
    }
    public Map<String,Integer> availabilityView(SessionService.Actor actor, String offerId, String bookingId) {
        find(BookingOffering.class, offerId);
        if (bookingId != null) {
            Reservation current = owned(actor, bookingId);
            require(current.offeringId.equals(offerId), "Booking does not belong to offering");
        }
        Instant now = clock.instant();
        Set<String> ownReviews = new HashSet<>();
        for (BookingReview review : em.createQuery("select r from BookingReview r where r.ownerId=:owner and r.status='PENDING' and r.expiresAt>:now", BookingReview.class)
                .setParameter("owner", actor.id()).setParameter("now", now).getResultList()) {
            boolean same = bookingId != null ? bookingId.equals(review.reservationId)
                    : review.reservationId == null && read(review.quote, Quote.class).itinerary().selection().offeringId().equals(offerId);
            if (same) ownReviews.add(review.id);
        }
        Map<String,Integer> result = new TreeMap<>();
        for (InventoryAllocation allocation : em.createQuery("select a from InventoryAllocation a where a.resourceKey like :prefix and (a.status='CONFIRMED' or (a.status='HOLD' and a.expiresAt>:now))", InventoryAllocation.class)
                .setParameter("prefix", offerId + "|%").setParameter("now", now).getResultList()) {
            if (ownReviews.contains(allocation.reviewId) || bookingId != null && bookingId.equals(allocation.reservationId)) continue;
            result.merge(allocation.resourceKey, allocation.quantity, Math::addExact);
        }
        return result;
    }
    private void availability(List<Resource> resources,String own,Instant now) { availability(resources,own,now,null); }
    private void availability(List<Resource> resources,String own,Instant now,String review) {
        for(Resource r:resources) {
            List<InventoryAllocation> active=em.createQuery("select a from InventoryAllocation a where a.resourceKey=:key and (a.status='CONFIRMED' or (a.status='HOLD' and a.expiresAt>:now))",InventoryAllocation.class)
                    .setParameter("key",r.key()).setParameter("now",now).getResultList();
            long used=active.stream().filter(a->!(own!=null&&own.equals(a.reservationId))&&!(review!=null&&review.equals(a.reviewId))).mapToLong(a->a.quantity).sum();
            conflict(used+r.quantity()<=r.capacity(),"Selected inventory is unavailable");
        }
    }
    private void supersede(SessionService.Actor actor,ReviewInput input) {
        for(BookingReview r:em.createQuery("select r from BookingReview r where r.ownerId=:owner and r.status='PENDING'",BookingReview.class).setParameter("owner",actor.id()).getResultList()) {
            boolean same=input.bookingId()!=null?input.bookingId().equals(r.reservationId)
                    :r.reservationId==null&&read(r.quote,Quote.class).itinerary().selection().offeringId().equals(input.offeringId());
            if(same) { r.status="SUPERSEDED"; releaseReview(r.id); }
        }
    }
    private void releaseReview(String id) { em.createQuery("update InventoryAllocation a set a.status='RELEASED' where a.reviewId=:id and a.status='HOLD'").setParameter("id",id).executeUpdate(); }
    private List<InventoryAllocation> allocations(String id) { return em.createQuery("select a from InventoryAllocation a where a.reservationId=:id",InventoryAllocation.class).setParameter("id",id).getResultList(); }
    private BankAccount accountFor(long owner) { return em.createQuery("select a from BankAccount a where a.ownerId=:owner",BankAccount.class).setParameter("owner",owner).getResultStream().findFirst().orElse(null); }
    private BankCard card(String syntheticId) {
        if(syntheticId==null||!syntheticId.startsWith("SIM-MC-")||syntheticId.length()>100) return null;
        return em.createQuery("select c from BankCard c where c.syntheticId=:id",BankCard.class).setParameter("id",syntheticId).getResultStream().findFirst().orElse(null);
    }
    private HolidayCalendar calendar(int year) { return em.createQuery("select c from HolidayCalendar c where c.calendarYear=:y and c.approved=true order by c.approvedAt desc,c.id desc",HolidayCalendar.class).setParameter("y",year).getResultStream().findFirst().orElse(null); }
    private Set<LocalDate> holidayDates(HolidayCalendar calendar) { try { return json.readValue(calendar.dates,new TypeReference<Set<LocalDate>>(){}); } catch(Exception e) { throw new IllegalStateException("Invalid stored calendar",e); } }
    private Reservation owned(SessionService.Actor actor,String id) { Reservation b=find(Reservation.class,id); actor.requireOwner(b.ownerId); return b; }
    private void requireStatus(Reservation b,String status) { conflict(status.equals(b.status),"Booking state does not permit this operation"); }
    private <T> T find(Class<T> type,String id) { T result=id==null?null:em.find(type,id); if(result==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found"); return result; }
    private Map<String,Object> bookingView(Reservation b) { return Map.of("id",b.id,"ownerId",b.ownerId,"status",b.status,"revision",b.revision,"originalAmount",b.originalAmount,"totalPaid",b.totalPaid,"itinerary",read(b.itinerary,Itinerary.class),"sourceAccountId",b.sourceAccountId,"simulation","SIMULATED","currency","VND"); }
    private Map<String,Object> reviewView(BookingReview r) { return Map.of("id",r.id,"digest",r.digest,"status",r.status,"expiresAt",r.expiresAt.toString(),"quote",read(r.quote,Quote.class),"simulation","SIMULATED","currency","VND"); }
    private void paymentAttempt(SessionService.Actor actor,BookingReview review,Reservation booking,String status,String reason,long amount,String key,Instant now) {
        PaymentAttempt p=new PaymentAttempt(); p.id=id(); p.operationId=operationId(actor,"PAY",key); p.ownerId=actor.id(); p.reviewId=review.id; p.reservationId=booking==null?null:booking.id; p.status=status; p.reason=reason; p.amount=amount; p.createdAt=now; em.persist(p);
    }
    private Map<String,Object> decline(SessionService.Actor actor,BookingReview review,long amount,String message,String key,Instant now) { paymentAttempt(actor,review,null,"FAILED",message,amount,key,now); return Map.of("status","FAILED","message",message,"simulation","SIMULATED","currency","VND"); }
    private Set<String> resourceKeys(List<Resource> resources) { Set<String> keys=new HashSet<>(); for(Resource r:resources) keys.add(r.key()); return keys; }
    private void ledger(String account,String booking,String kind,long amount,String operation,Instant now) {
        BankTransaction t=new BankTransaction(); t.id=id(); t.accountId=account; t.reservationId=booking; t.kind=kind; t.amount=amount; t.operationId=operation; t.createdAt=now; em.persist(t);
    }
    private void history(SessionService.Actor actor,Reservation booking,String action,Object details,String operation,Instant now) {
        ReservationHistory h=new ReservationHistory(); h.id=id(); h.reservationId=booking.id; h.actorId=actor.id(); h.action=action; h.details=write(details); h.createdAt=now; h.operationId=operation; em.persist(h);
    }
    private Map<String,Object> once(SessionService.Actor actor,String action,String key,Object payload,Supplier<Map<String,Object>> work) { return once(actor,action,key,payload,work,false); }
    private Map<String,Object> once(SessionService.Actor actor,String action,String key,Object payload,Supplier<Map<String,Object>> work,boolean redacted) {
        require(key!=null&&!key.isBlank()&&key.length()<=120,"Idempotency-Key is required (maximum 120 characters)");
        String operation=operationId(actor,action,key), hash=digest(write(payload)); BookingOperation previous=em.find(BookingOperation.class,operation);
        if(previous!=null) { conflict(previous.requestDigest.equals(hash),"Idempotency key was already used for different input"); return readMap(previous.result); }
        Map<String,Object> result=work.get(); BookingOperation op=new BookingOperation(); op.id=operation; op.ownerId=actor.id(); op.action=action; op.requestDigest=hash;
        Map<String,Object> stored=new LinkedHashMap<>(result); if(redacted) stored.remove("testCvv"); op.result=write(stored); em.persist(op); em.flush(); return result;
    }
    private String operationId(SessionService.Actor actor,String action,String key) { return digest(actor.id()+"|"+action+"|"+Objects.toString(key,"")); }
    private String id() { return UUID.randomUUID().toString(); }
    private String digest(String value) { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); } catch(NoSuchAlgorithmException e) { throw new IllegalStateException(e); } }
    private String write(Object value) { try { return json.writeValueAsString(value); } catch(Exception e) { throw new IllegalArgumentException("Invalid request structure"); } }
    private <T> T read(String value,Class<T> type) { try { return json.readValue(value,type); } catch(Exception e) { throw new IllegalStateException("Invalid persisted booking state",e); } }
    private Map<String,Object> readMap(String value) { try { return json.readValue(value,new TypeReference<LinkedHashMap<String,Object>>(){}); } catch(Exception e) { throw new IllegalStateException("Invalid persisted response",e); } }
    private void conflict(boolean condition,String message) { if(!condition) throw new ResponseStatusException(HttpStatus.CONFLICT,message); }
    private ResponseStatusException bad(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,message); }
}
