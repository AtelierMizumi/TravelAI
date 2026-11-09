package com.travelai.backend.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.ApiSecurity;
import jakarta.persistence.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import static com.travelai.backend.booking.BookingContracts.Itinerary;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    private final EntityManager em;
    private final ObjectMapper json;
    private final Clock clock;
    private final UserRepository users;
    public RatingController(EntityManager em, ObjectMapper json, Clock clock, UserRepository users) { this.em=em; this.json=json; this.clock=clock; this.users=users; }
    public record RatingInput(String bookingId, int stars, String comment, String image) {}

    @PostMapping
    @Transactional
    public Map<String,Object> create(HttpServletRequest request, @RequestBody RatingInput input) {
        long actor = ApiSecurity.actor(request).id();
        if (input == null || input.bookingId() == null || input.stars() < 1 || input.stars() > 5 || input.comment() == null || input.comment().trim().isEmpty() || input.comment().length() > 3000)
            throw bad("Cần chọn 1–5 sao và nhập nội dung tối đa 3000 ký tự.");
        validateImage(input.image());
        em.createNativeQuery("insert into booking_barrier(id) values (1) on conflict do nothing").executeUpdate();
        em.createNativeQuery("select id from booking_barrier where id=1 for update").getSingleResult();
        Reservation booking = em.find(Reservation.class, input.bookingId(), LockModeType.PESSIMISTIC_WRITE);
        if (booking == null || booking.ownerId != actor) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đặt chỗ của bạn.");
        if (!"CONFIRMED".equals(booking.status)) throw conflict("Chỉ đặt chỗ đã xác nhận và hoàn tất mới có thể đánh giá.");
        Itinerary itinerary;
        try { itinerary=json.readValue(booking.itinerary,Itinerary.class); } catch (Exception e) { throw conflict("Không xác định được lịch trình đặt chỗ."); }
        Instant now=clock.instant();
        if (itinerary.end()==null || itinerary.start()==null || ("TOUR".equals(itinerary.kind()) && !itinerary.end().isAfter(itinerary.start())))
            throw conflict("Lịch tour chưa có giờ kết thúc được xác minh; vui lòng liên hệ hỗ trợ.");
        if (now.isBefore(itinerary.end())) throw conflict("Chỉ có thể đánh giá sau khi trải nghiệm kết thúc.");
        BookingOffering offer=em.find(BookingOffering.class, booking.offeringId);
        if (offer==null || offer.legacyId==null || !Set.of("TOUR","HOTEL").contains(offer.kind) || !offer.kind.equals(itinerary.kind())) throw conflict("Dịch vụ chưa liên kết với danh mục.");
        Long existing=em.createQuery("select count(r) from ServiceRating r where r.reservationId=:id",Long.class).setParameter("id",booking.id).getSingleResult();
        if (existing>0) throw conflict("Đặt chỗ này đã được đánh giá.");
        ServiceRating r=new ServiceRating(); r.id=UUID.randomUUID().toString(); r.reservationId=booking.id; r.authorId=actor;
        r.authorName=users.findById(actor).map(u -> u.getName()!=null&&!u.getName().isBlank()?u.getName():"Khách du lịch").orElse("Khách du lịch");
        r.kind=offer.kind; r.catalogId=offer.legacyId; r.stars=input.stars(); r.comment=input.comment().trim(); r.image=input.image(); r.createdAt=now;
        em.persist(r); em.flush(); return view(r);
    }
    @GetMapping("/{kind}/{catalogId}")
    @Transactional(readOnly=true)
    public Map<String,Object> list(@PathVariable String kind, @PathVariable long catalogId, @RequestParam(defaultValue="top") String sort,
                                   @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="0") int stars) {
        if (!Set.of("TOUR","HOTEL").contains(kind) || catalogId <= 0 || !Set.of("top","recent").contains(sort) || page < 0 || page > 10000 || stars < 0 || stars > 5) throw bad("Bộ lọc không hợp lệ.");
        String filter=" from ServiceRating r where r.kind=:kind and r.catalogId=:id and (:stars=0 or r.stars=:stars)";
        String order=sort.equals("top") ? " order by r.stars desc,r.createdAt desc,r.id desc" : " order by r.createdAt desc,r.id desc";
        List<ServiceRating> ratings=em.createQuery("select r"+filter+order,ServiceRating.class).setParameter("kind",kind).setParameter("id",catalogId).setParameter("stars",stars).setFirstResult(page*6).setMaxResults(7).getResultList();
        long count=em.createQuery("select count(r)"+filter,Long.class).setParameter("kind",kind).setParameter("id",catalogId).setParameter("stars",stars).getSingleResult();
        return Map.of("items",ratings.stream().limit(6).map(RatingController::view).toList(),"hasMore",ratings.size()>6,"count",count);
    }
    private static Map<String,Object> view(ServiceRating r) {
        Map<String,Object> result=new LinkedHashMap<>(); result.put("id",r.id); result.put("authorName",r.authorName); result.put("stars",r.stars); result.put("comment",r.comment); result.put("image",r.image); result.put("createdAt",r.createdAt); return result;
    }
    private static void validateImage(String image) {
        if (image==null || image.isBlank()) return;
        if (!image.startsWith("data:image/jpeg;base64,") || image.length()>1_400_000) throw bad("Ảnh đánh giá phải là JPEG và nhỏ hơn 1 MB.");
        try { byte[] bytes=Base64.getDecoder().decode(image.substring("data:image/jpeg;base64,".length()));
            if (bytes.length<3 || bytes.length>1_000_000 || (bytes[0]&255)!=255 || (bytes[1]&255)!=216 || (bytes[2]&255)!=255) throw bad("Ảnh JPEG không hợp lệ.");
        } catch (IllegalArgumentException e) { throw bad("Ảnh JPEG không hợp lệ."); }
    }
    private static ResponseStatusException bad(String s) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,s); }
    private static ResponseStatusException conflict(String s) { return new ResponseStatusException(HttpStatus.CONFLICT,s); }
}
