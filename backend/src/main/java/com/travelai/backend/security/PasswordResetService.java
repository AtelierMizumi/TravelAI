package com.travelai.backend.security;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import jakarta.persistence.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {
    private static final Logger log=LoggerFactory.getLogger(PasswordResetService.class);
    private final UserRepository users; private final EntityManager em; private final Clock clock; private final SessionService sessions; private final ResetEmail mail; private final byte[] secret; private final TransactionTemplate transactions;
    private final Map<String,Window> windows=new ConcurrentHashMap<>();
    private record Window(long minute,int count) {}
    record Delivery(long userId,String recipient,String code) {}
    PasswordResetService(UserRepository users,EntityManager em,Clock clock,SessionService sessions,ResetEmail mail,PlatformTransactionManager manager,@Value("${travelai.reset.secret:}") String value) {
        this.users=users;this.em=em;this.clock=clock;this.sessions=sessions;this.mail=mail;
        this.transactions=new TransactionTemplate(manager);
        byte[] decoded; try { decoded=Base64.getDecoder().decode(value); } catch (IllegalArgumentException e) { decoded=new byte[0]; } secret=decoded;
    }
    public boolean configured() { return secret.length>=32 && mail.configured(); }
    public void request(String email,String address) {
        if(!configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Dịch vụ email khôi phục chưa được cấu hình.");
        limit(address,"request",10); String normalized=normalize(email);
        // Check the SMTP account for every address, including unknown accounts, so
        // a configuration failure does not disclose whether an email is registered.
        try { mail.checkConnection(); }
        catch (RuntimeException error) {
            log.warn("Password reset email connection failed ({})",error.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Dịch vụ gửi email chưa sẵn sàng. Vui lòng thử lại sau.");
        }
        Delivery delivery=transactions.execute(status -> issue(normalized));
        if(delivery!=null) {
            try { mail.send(delivery.recipient(),delivery.code()); }
            catch (RuntimeException error) {
                log.warn("Password reset email delivery failed ({})",error.getClass().getSimpleName());
                transactions.executeWithoutResult(status -> invalidate(delivery));
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Không gửi được email xác nhận. Vui lòng thử lại sau.");
            }
        }
    }
    // This is a separate transaction so the code is committed before an email can arrive.
    private Delivery issue(String email) {
        User found=users.findByEmail(email).orElse(null);
        if(found==null || "blocked".equalsIgnoreCase(found.getStatus())) return null;
        User user=em.find(User.class,found.getId(),LockModeType.PESSIMISTIC_WRITE);
        PasswordResetRequest token=em.find(PasswordResetRequest.class,user.getId(),LockModeType.PESSIMISTIC_WRITE);
        Instant now=clock.instant();
        if(token!=null && !token.consumed && now.isBefore(token.createdAt.plusSeconds(60))) return null;
        String code=String.format(Locale.ROOT,"%06d",new SecureRandom().nextInt(1_000_000));
        boolean created=token==null;
        if(created) { token=new PasswordResetRequest(); token.userId=user.getId(); }
        token.codeDigest=digest(user.getId(),code); token.createdAt=now; token.expiresAt=now.plus(Duration.ofMinutes(10)); token.failedAttempts=0; token.consumed=false;
        token.ticketDigest=null; token.ticketExpiresAt=null;
        if(created) em.persist(token);
        em.flush(); return new Delivery(user.getId(),email,code);
    }
    private void invalidate(Delivery delivery) {
        em.find(User.class,delivery.userId(),LockModeType.PESSIMISTIC_WRITE);
        PasswordResetRequest token=em.find(PasswordResetRequest.class,delivery.userId(),LockModeType.PESSIMISTIC_WRITE);
        if(token!=null && MessageDigest.isEqual(token.codeDigest.getBytes(StandardCharsets.US_ASCII),digest(delivery.userId(),delivery.code()).getBytes(StandardCharsets.US_ASCII))) token.consumed=true;
    }
    @Transactional
    public String verifyCode(String email,String code,String address) {
        if(!configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Dịch vụ email khôi phục chưa được cấu hình.");
        limit(address,"verify",30); String normalized=normalize(email);
        if(code==null || !code.matches("[0-9]{6}")) return null;
        User found=users.findByEmail(normalized).orElse(null); if(found==null) return null;
        User user=em.find(User.class,found.getId(),LockModeType.PESSIMISTIC_WRITE);
        PasswordResetRequest token=em.find(PasswordResetRequest.class,user.getId(),LockModeType.PESSIMISTIC_WRITE);
        Instant now=clock.instant();
        if(token==null || token.consumed || token.failedAttempts>=5 || !now.isBefore(token.expiresAt) || "blocked".equalsIgnoreCase(user.getStatus())) return null;
        if(!MessageDigest.isEqual(token.codeDigest.getBytes(StandardCharsets.US_ASCII),digest(user.getId(),code).getBytes(StandardCharsets.US_ASCII))) { token.failedAttempts++; return null; }
        byte[] random=new byte[32]; new SecureRandom().nextBytes(random);
        String ticket=Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        token.consumed=true; token.ticketDigest=digest(user.getId(),"ticket:"+ticket);
        Instant maxTicketExpiry=now.plus(Duration.ofMinutes(5));
        token.ticketExpiresAt=maxTicketExpiry.isBefore(token.expiresAt)?maxTicketExpiry:token.expiresAt;
        return ticket;
    }
    @Transactional
    public boolean changePassword(String email,String ticket,String password,String address) {
        if(!configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Dịch vụ email khôi phục chưa được cấu hình.");
        limit(address,"change",30); String normalized=normalize(email);
        if(ticket==null || !ticket.matches("[A-Za-z0-9_-]{43}")) return false;
        User found=users.findByEmail(normalized).orElse(null); if(found==null) return false;
        User user=em.find(User.class,found.getId(),LockModeType.PESSIMISTIC_WRITE);
        PasswordResetRequest token=em.find(PasswordResetRequest.class,user.getId(),LockModeType.PESSIMISTIC_WRITE);
        if(token==null || !token.consumed || token.ticketDigest==null || token.ticketExpiresAt==null || !clock.instant().isBefore(token.ticketExpiresAt) || "blocked".equalsIgnoreCase(user.getStatus())) return false;
        if(!MessageDigest.isEqual(token.ticketDigest.getBytes(StandardCharsets.US_ASCII),digest(user.getId(),"ticket:"+ticket).getBytes(StandardCharsets.US_ASCII))) return false;
        user.setPassword(PasswordHashes.encode(password)); token.ticketDigest=null; token.ticketExpiresAt=null; sessions.revokeUser(user.getId()); return true;
    }
    private String normalize(String email) {
        String value=email==null?"":email.trim().toLowerCase(Locale.ROOT);
        if(value.length()>254 || !value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Vui lòng nhập email hợp lệ.");
        return value;
    }
    private String digest(long id,String code) {
        try { Mac mac=Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret,"HmacSHA256")); return HexFormat.of().formatHex(mac.doFinal((id+":"+code).getBytes(StandardCharsets.UTF_8))); }
        catch (GeneralSecurityException e) { throw new IllegalStateException("Password reset unavailable",e); }
    }
    private void limit(String address,String action,int max) {
        long minute=clock.instant().getEpochSecond()/60; String key=action+":"+Objects.toString(address,"unknown");
        Window window=windows.compute(key,(k,old)->old==null||old.minute()!=minute?new Window(minute,1):new Window(minute,old.count()+1));
        if(windows.size()>10000) windows.entrySet().removeIf(e->e.getValue().minute()<minute-2);
        if(window.count()>max) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.");
    }
}
