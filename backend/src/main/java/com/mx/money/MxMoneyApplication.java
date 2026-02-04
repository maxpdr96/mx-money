package com.mx.money;

import com.mx.money.service.RecurringTransactionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MxMoneyApplication {

    public static void main(String[] args) {
        // Garante que o diretório de dados existe antes de iniciar o Spring/Hibernate
        new java.io.File("./data").mkdirs();
        SpringApplication.run(MxMoneyApplication.class, args);
    }

    /**
     * Gera transações recorrentes pendentes ao iniciar a aplicação
     */
    @Bean
    CommandLineRunner generatePendingRecurringTransactions(RecurringTransactionService service) {
        return args -> {
            int count = service.generateRecurringTransactions();
            if (count > 0) {
                System.out.println("✓ Generated " + count + " recurring transactions on startup");
            }
        };
    }
}
