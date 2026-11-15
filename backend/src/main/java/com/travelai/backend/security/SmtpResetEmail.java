package com.travelai.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import jakarta.mail.MessagingException;

@Component
class SmtpResetEmail implements ResetEmail {
    private final String host, username, password, from;
    private final int port;
    SmtpResetEmail(@Value("${travelai.smtp.host:smtp.gmail.com}") String host,
                   @Value("${travelai.smtp.port:587}") int port,
                   @Value("${travelai.smtp.username:}") String username,
                   @Value("${travelai.smtp.password:}") String password,
                   @Value("${travelai.smtp.from:}") String from) {
        this.host=host; this.port=port; this.username=username; this.password=password; this.from=from;
    }
    public boolean configured() { return !host.isBlank() && !username.isBlank() && !password.isBlank() && port>0 && port<=65535; }
    private JavaMailSenderImpl sender() {
        JavaMailSenderImpl sender=new JavaMailSenderImpl(); sender.setHost(host); sender.setPort(port); sender.setUsername(username); sender.setPassword(password);
        var props=sender.getJavaMailProperties(); props.put("mail.smtp.auth","true"); props.put("mail.smtp.starttls.enable","true"); props.put("mail.smtp.starttls.required","true"); props.put("mail.smtp.ssl.checkserveridentity","true"); props.put("mail.smtp.connectiontimeout","5000"); props.put("mail.smtp.timeout","5000"); props.put("mail.smtp.writetimeout","5000");
        return sender;
    }
    public void checkConnection() {
        try { sender().testConnection(); }
        catch (MessagingException e) { throw new IllegalStateException("SMTP connection unavailable", e); }
    }
    public void send(String recipient,String code) {
        SimpleMailMessage message=new SimpleMailMessage(); message.setFrom(from.isBlank()?username:from); message.setTo(recipient);
        message.setSubject("Mã đặt lại mật khẩu TravelAI");
        message.setText("Mã xác nhận của bạn: "+code+"\nMã có hiệu lực 10 phút và chỉ dùng một lần. Nếu bạn không yêu cầu, hãy bỏ qua email này.");
        sender().send(message);
    }
}
