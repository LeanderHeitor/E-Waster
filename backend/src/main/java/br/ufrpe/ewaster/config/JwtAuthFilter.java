package br.ufrpe.ewaster.config;

import br.ufrpe.ewaster.auth.service.JwtService;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, @Lazy UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.debug("JwtAuthFilter: {} {} auth={}",
                request.getMethod(), request.getRequestURI(),
                authHeader == null ? "<none>" : authHeader.substring(0, Math.min(20, authHeader.length())));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractEmail(token);
            log.debug("JwtAuthFilter: extracted email={}", email);

            if (email != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                Optional<User> userOpt = userRepository.findByEmail(email);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    var authority = new SimpleGrantedAuthority(
                            "ROLE_" + user.getTipo().name()
                    );

                    var auth = new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            List.of(authority)
                    );

                    SecurityContext ctx = SecurityContextHolder.createEmptyContext();
                    ctx.setAuthentication(auth);
                    SecurityContextHolder.setContext(ctx);

                    log.debug("JwtAuthFilter: authenticated {}", user.getEmail());
                } else {
                    log.debug("JwtAuthFilter: user not found for email {}", email);
                }
            }
        } catch (Exception e) {
            log.debug("JwtAuthFilter: token invalido ({})", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
