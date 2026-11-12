package com.example.dapdap.auth.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    @Qualifier("gmailSender")
    private final JavaMailSender gmailSender;

    @Qualifier("naverSender")
    private final JavaMailSender naverSender;

    @Value("${mail.gmail.from}")
    private String gmailFrom;

    @Value("${mail.naver.from}")
    private String naverFrom;

    /**
     * 이메일 주소에 따라 자동 SMTP 선택
     * - @naver.com → 네이버 발송
     * - 나머지 → Gmail 발송
     */
    public void sendMail(String to, String subject, String msg) {
        if (to.endsWith("@naver.com")) {
            send(naverSender, to, subject, msg, naverFrom);
        } else {
            send(gmailSender, to, subject, msg, gmailFrom);
        }
    }

    private void send(JavaMailSender sender, String to, String subject, String msg, String from) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(msg);
        mail.setFrom(from);   // 네이버는 여기 반드시 필요!
        sender.send(mail);
    }
}
