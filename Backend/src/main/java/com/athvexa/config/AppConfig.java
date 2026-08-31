package com.athvexa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * AppConfig — registers application-wide Spring beans.
 *
 * RestTemplate is used by AIService to call the Gemini REST API.
 * It is intentionally kept as a simple bean (no custom timeouts needed
 * for the free-tier Gemini API which typically responds within 2-5 seconds).
 */
@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
