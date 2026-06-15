package br.ufrpe.ewaster.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // Evita que o Spring Boot registre o filtro automaticamente no servlet container
    // (ele só deve rodar dentro do SecurityFilterChain).
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/health",
                                "/api/v1/auth/**",
                                "/api/v1/usuarios/ranking", // <-- ADICIONADO: Rota do ranking agora está liberada
                                "/error",
                                "/agendamentos",
                                "/agendamentos/**"
                        ).permitAll()
                        // Rotas administrativas: exigem papel ADMIN (resolvido pelo JwtAuthFilter).
                        .requestMatchers("/api/v1/descartes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/agendamentos/pendentes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/agendamentos/*/recusar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/slots").hasRole("ADMIN")
                        // Campanhas: leitura liberada a autenticados; criar/editar/excluir é só ADMIN.
                        .requestMatchers(HttpMethod.POST, "/api/v1/campanhas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/campanhas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/campanhas/**").hasRole("ADMIN")
                        // Relatorios administrativos (engajamento, residuos, descartes por periodo): somente ADMIN.
                        .requestMatchers("/api/v1/relatorios/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}