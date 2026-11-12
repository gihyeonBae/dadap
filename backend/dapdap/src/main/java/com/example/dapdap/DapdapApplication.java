package com.example.dapdap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class DapdapApplication {

    public static void main(String[] args) {
        SpringApplication.run(DapdapApplication.class, args);
    }

}
