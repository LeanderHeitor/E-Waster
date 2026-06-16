package br.ufrpe.ewaster.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    // Origens permitidas (CORS). Em dev, o front roda em localhost:5173.
    // Em producao, defina a variavel de ambiente APP_CORS_ALLOWED_ORIGINS
    // com a(s) URL(s) do front separadas por virgula, ex:
    //   APP_CORS_ALLOWED_ORIGINS=https://ewaster-frontend.onrender.com
    // Aceita curingas via allowedOriginPatterns, ex: https://*.onrender.com
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        final String[] origins = allowedOrigins.split(",");

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        .allowedOriginPatterns(origins)
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}