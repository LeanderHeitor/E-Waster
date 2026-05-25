package br.ufrpe.ewaster.auth;

import br.ufrpe.ewaster.auth.dto.AuthResponse;
import br.ufrpe.ewaster.auth.dto.ErrorResponse;
import br.ufrpe.ewaster.auth.dto.LoginRequest;
import br.ufrpe.ewaster.auth.dto.RegisterRequest;
import br.ufrpe.ewaster.auth.service.JwtService;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getEmail() == null || request.getSenha() == null) {
            return ResponseEntity.status(400)
                    .body(new ErrorResponse("Informe e-mail e senha"));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()
                || !passwordEncoder.matches(request.getSenha(), userOpt.get().getSenha())) {

            return ResponseEntity.status(401)
                    .body(new ErrorResponse("E-mail ou senha inválidos"));
        }

        User user = userOpt.get();
        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, user.getNome(), user.getEmail()));
    }
}
