package com.mx.money;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MxMoneyApplication {

    public static void main(String[] args) {
        // Garante que o diretório de dados existe antes de iniciar o Spring/Hibernate
        new java.io.File("./data").mkdirs();
        SpringApplication.run(MxMoneyApplication.class, args);
    }
}
