package com.travelai.backend.security;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.security.*;
import java.time.*;
import java.util.*;

@Service
@Transactional
public class SessionService {
    public record Actor(long id, String role) {
        public boolean admin() { return "ADMIN".equals(role); }
        public void requireAdmin() { if (!admin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access required"); }
        public void requireOwner(long owner) { if (id != owner && !admin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Booking belongs to another traveler"); }
    }
    private final UserRepository users;
    private final EntityManager em;
    private final Clock clock;
    public SessionService(UserRepository users, EntityManager em, Clock clock) {
        this.users=users; this.em=em; this.clock=clock;
    }
    public Map<String,Object> register(User request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!email.contains("@") || email.length()>254 || users.findByEmail(email).isPresent())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid or already registered email");
        User user = User.builder().email(email).name(request.getName() == null ? "" : request.getName().trim())
                .password(PasswordHashes.encode(request.getPassword())).role("USER").status("active").bio("").avatar("").build();
        users.saveAndFlush(user);
        Map<String,Object> result = new LinkedHashMap<>(login(email, request.getPassword()));
        result.put("message", "Register successfully");
        return result;
    }
    public Map<String,Object> login(String email, String password) {
        User user = users.findByEmail(email == null ? "" : email.trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user==null || password==null || password.isEmpty() || password.length()>1024 || user.getPassword()==null) throw denied();
        boolean hashed = user.getPassword()!=null && user.getPassword().startsWith("pbkdf2$");
        boolean valid = hashed ? PasswordHashes.matches(password,user.getPassword())
                : MessageDigest.isEqual(password.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                  Objects.toString(user.getPassword(),"").getBytes(java.nio.charset.StandardCharsets.UTF_8));
        if (!valid || "blocked".equalsIgnoreCase(user.getStatus())) throw denied();
        if (!hashed) user.setPassword(PasswordHashes.upgradeLegacy(password));
        byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant now=clock.instant(); AuthSession session=new AuthSession();
        session.tokenDigest=PasswordHashes.digest(token); session.userId=user.getId();
        session.issuedAt=now; session.lastActivityAt=now; session.expiresAt=now.plus(Duration.ofDays(7));
        em.persist(session);
        return Map.of("message","Login successfully","user",view(user),"token",token,"expiresAt",session.expiresAt.toString());
    }
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public Actor authenticate(String authorization) {
        if (authorization==null || !authorization.startsWith("Bearer ") || authorization.length()>512) throw denied();
        AuthSession session=em.find(AuthSession.class,PasswordHashes.digest(authorization.substring(7)));
        Instant now=clock.instant();
        if (session==null || !now.isBefore(session.expiresAt) || !now.isBefore(session.lastActivityAt.plus(Duration.ofHours(24)))) throw denied();
        User user=users.findById(session.userId).orElseThrow(SessionService::denied);
        if ("blocked".equalsIgnoreCase(user.getStatus())) { revokeUser(user.getId()); throw denied(); }
        session.lastActivityAt=now;
        return new Actor(user.getId(),Objects.toString(user.getRole(),"USER"));
    }
    public void logout(String authorization) {
        if (authorization!=null && authorization.startsWith("Bearer ")) {
            AuthSession session=em.find(AuthSession.class,PasswordHashes.digest(authorization.substring(7)));
            if (session!=null) em.remove(session);
        }
    }
    public void changePassword(long id, String oldPassword, String newPassword, String confirmation) {
        User user=users.findById(id).orElseThrow(SessionService::denied);
        if (!PasswordHashes.matches(oldPassword,user.getPassword()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Current password is incorrect");
        if (!Objects.equals(newPassword,confirmation))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Password confirmation does not match");
        user.setPassword(PasswordHashes.encode(newPassword));
        revokeUser(id);
    }
    public void revokeUser(long id) { em.createQuery("delete from AuthSession s where s.userId=:id").setParameter("id",id).executeUpdate(); }
    public static Map<String,Object> view(User u) {
        return Map.of("id",u.getId(),"name",Objects.toString(u.getName(),""),"email",u.getEmail(),
                "role",Objects.toString(u.getRole(),"USER"),"status",Objects.toString(u.getStatus(),"active"),
                "bio",Objects.toString(u.getBio(),""),"avatar",Objects.toString(u.getAvatar(),""));
    }
    private static ResponseStatusException denied() { return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid or expired credentials"); }
}
