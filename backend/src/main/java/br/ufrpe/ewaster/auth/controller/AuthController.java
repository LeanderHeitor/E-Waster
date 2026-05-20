package br.ufrpe.ewaster.auth;

import br.ufrpe.ewaster.auth.dto.RegisterRequest;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {

            return ResponseEntity.badRequest()
                    .body("E-mail já cadastrado");
        }

        User user = new User(
                request.getNome(),
                request.getEmail(),
                passwordEncoder.encode(request.getSenha())
        );

        userRepository.save(user);

        return ResponseEntity.ok("Usuário cadastrado");
    }
}