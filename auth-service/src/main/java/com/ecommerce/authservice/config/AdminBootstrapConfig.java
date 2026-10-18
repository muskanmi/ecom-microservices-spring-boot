
package com.ecommerce.authservice.config;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

import com.ecommerce.authservice.entity.User;
import com.ecommerce.authservice.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class AdminBootstrapConfig {

    @Bean
    @ConditionalOnProperty(name = "admin.bootstrap.enabled", havingValue = "true")
    public CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_BOOTSTRAP_NAME:}") String name,
            @Value("${ADMIN_BOOTSTRAP_EMAIL:}") String email,
            @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String password) {

        return args -> {
            if (!StringUtils.hasText(name)
                    || !StringUtils.hasText(email)
                    || !StringUtils.hasText(password)) {
                throw new IllegalStateException(
                        "Admin bootstrap requires ADMIN_BOOTSTRAP_NAME, "
                                + "ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD "
                                + "in Spring configuration.");
            }

            if (password.length() < 12) {
                throw new IllegalStateException(
                        "Bootstrap admin password must contain at least 12 characters.");
            }

            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

            if (userRepository.existsByEmail(normalizedEmail)) {
                log.info(
                        "Bootstrap admin email already exists. No account created.");
                return;
            }

            User admin = new User();
            admin.setName(name.trim());
            admin.setEmail(normalizedEmail);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);

            log.info("Initial ADMIN account created: {}", normalizedEmail);
        };
    }
}
