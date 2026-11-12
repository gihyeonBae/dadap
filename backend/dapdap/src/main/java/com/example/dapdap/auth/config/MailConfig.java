package com.example.dapdap.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean(name = "gmailSender")
    public JavaMailSender gmailSender(
            @Value("${mail.gmail.host}") String host,
            @Value("${mail.gmail.port}") int port,
            @Value("${mail.gmail.username}") String username,
            @Value("${mail.gmail.password}") String password) {

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        return sender;
    }


    @Bean(name = "naverSender")
    public JavaMailSender naverSender(
            @Value("${mail.naver.host}") String host,
            @Value("${mail.naver.port}") int port,
            @Value("${mail.naver.username}") String username,
            @Value("${mail.naver.password}") String password) {

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        return sender;
    }
}
