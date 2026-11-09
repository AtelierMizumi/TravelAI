package com.travelai.backend.security;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties="travelai.reset.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
@Import(PasswordResetIntegrationTest.TimeConfig.class)
class PasswordResetIntegrationTest {
    static class FakeClock extends Clock { volatile Instant now=Instant.parse("2026-01-01T00:00:00Z"); public ZoneId getZone(){return ZoneOffset.UTC;} public Clock withZone(ZoneId zone){return Clock.fixed(now,zone);} public Instant instant(){return now;} }
    @TestConfiguration static class TimeConfig { @Bean @Primary FakeClock resetClock(){return new FakeClock();} }
    @MockBean ResetEmail emailSender;
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired UserRepository users; @Autowired SessionService sessions; @Autowired FakeClock clock; @Autowired JdbcTemplate jdbc;
    final AtomicReference<String> code=new AtomicReference<>(); User user; String oldToken;
    @BeforeEach void setup() {
        clock.now=Instant.parse("2026-01-01T00:00:00Z"); reset(emailSender); when(emailSender.configured()).thenReturn(true);
        doAnswer(invocation->{ code.set(invocation.getArgument(1)); return null; }).when(emailSender).send(anyString(),anyString());
        user=User.builder().name("Synthetic").email(UUID.randomUUID()+"@example.test").password(PasswordHashes.encode("OldPass123")).role("USER").status("active").build(); users.saveAndFlush(user);
        oldToken=(String)sessions.login(user.getEmail(),"OldPass123").get("token"); code.set(null);
    }
    void request(String email) throws Exception { mvc.perform(post("/api/auth/password-reset/request").contentType("application/json").content(json.writeValueAsString(Map.of("email",email)))).andExpect(status().isOk()); }
    String codeBody(String value) throws Exception { return json.writeValueAsString(Map.of("email",user.getEmail(),"code",value)); }
    String confirmation(String ticket,String password) throws Exception { return json.writeValueAsString(Map.of("email",user.getEmail(),"ticket",ticket,"newPassword",password,"confirmPassword",password)); }
    String verifyCode(String value) throws Exception {
        String response=mvc.perform(post("/api/auth/password-reset/verify").contentType("application/json").content(codeBody(value)))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store")).andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("ticket").asText();
    }
    @Test void sendsOnlyToRegisteredAddressAndResetsOnceRevokingSessions() throws Exception {
        request(user.getEmail()); assertNotNull(code.get()); verify(emailSender).send(eq(user.getEmail()),eq(code.get()));
        String digest=jdbc.queryForObject("select code_digest from password_reset_requests where user_id=?",String.class,user.getId()); assertNotEquals(code.get(),digest); assertEquals(64,digest.length());
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json").content(confirmation(code.get(),"NewPass123"))).andExpect(status().isBadRequest());
        String ticket=verifyCode(code.get());
        mvc.perform(post("/api/auth/password-reset/verify").contentType("application/json").content(codeBody(code.get()))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json").content(confirmation(ticket,"NewPass123"))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json").content(confirmation(ticket,"NewPass123"))).andExpect(status().isBadRequest());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+oldToken)).andExpect(status().isUnauthorized());
        assertNotNull(sessions.login(user.getEmail(),"NewPass123").get("token"));
        request("unknown@example.test"); verify(emailSender,times(1)).send(anyString(),anyString());
    }
    @Test void rejectsExpiredAndAfterFiveWrongAttempts() throws Exception {
        request(user.getEmail()); String valid=code.get(); String wrong=valid.equals("000000")?"000001":"000000";
        for(int i=0;i<5;i++) mvc.perform(post("/api/auth/password-reset/verify").contentType("application/json").content(codeBody(wrong))).andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/password-reset/verify").contentType("application/json").content(codeBody(valid))).andExpect(status().isBadRequest());
        clock.now=clock.now.plusSeconds(61); request(user.getEmail()); valid=code.get(); clock.now=clock.now.plusSeconds(600);
        mvc.perform(post("/api/auth/password-reset/verify").contentType("application/json").content(codeBody(valid))).andExpect(status().isBadRequest());
    }
    @Test void resendCooldownDoesNotGenerateAdditionalEmails() throws Exception {
        request(user.getEmail()); request(user.getEmail()); verify(emailSender,times(1)).send(anyString(),anyString());
        clock.now=clock.now.plusSeconds(60); request(user.getEmail()); verify(emailSender,times(2)).send(anyString(),anyString());
    }
    @Test void smtpConnectionFailureReturnsServiceErrorForRegisteredAndUnknownEmail() throws Exception {
        doThrow(new IllegalStateException("synthetic SMTP failure")).when(emailSender).checkConnection();
        for (String address : List.of(user.getEmail(), "unknown@example.test")) {
            mvc.perform(post("/api/auth/password-reset/request").contentType("application/json")
                    .content(json.writeValueAsString(Map.of("email",address))))
                    .andExpect(status().isServiceUnavailable());
        }
        verify(emailSender,never()).send(anyString(),anyString());
        assertEquals(0,jdbc.queryForObject("select count(*) from password_reset_requests where user_id=?",Integer.class,user.getId()));
    }
    @Test void sendFailureInvalidatesCodeAndAllowsImmediateRetry() throws Exception {
        doThrow(new IllegalStateException("synthetic mail failure")).doAnswer(invocation -> {
            code.set(invocation.getArgument(1)); return null;
        }).when(emailSender).send(anyString(),anyString());
        mvc.perform(post("/api/auth/password-reset/request").contentType("application/json")
                .content(json.writeValueAsString(Map.of("email",user.getEmail()))))
                .andExpect(status().isServiceUnavailable());
        assertTrue(jdbc.queryForObject("select consumed from password_reset_requests where user_id=?",Boolean.class,user.getId()));
        request(user.getEmail());
        assertNotNull(code.get());
        String ticket=verifyCode(code.get());
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json")
                .content(confirmation(ticket,"NewPass123"))).andExpect(status().isOk());
    }
    @Test void verifiedTicketExpiresAndNewRequestInvalidatesPreviousTicket() throws Exception {
        request(user.getEmail()); String ticket=verifyCode(code.get());
        clock.now=clock.now.plusSeconds(300);
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json").content(confirmation(ticket,"NewPass123"))).andExpect(status().isBadRequest());
        request(user.getEmail()); ticket=verifyCode(code.get());
        request(user.getEmail());
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json").content(confirmation(ticket,"NewPass123"))).andExpect(status().isBadRequest());
        String fresh=verifyCode(code.get());
        mvc.perform(post("/api/auth/password-reset/confirm").contentType("application/json").content(confirmation(fresh,"NewPass123"))).andExpect(status().isOk());
    }
}
