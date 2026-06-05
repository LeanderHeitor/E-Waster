package br.ufrpe.ewaster.user;
import br.ufrpe.ewaster.user.dto.AtualizarUsuarioRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import br.ufrpe.ewaster.user.dto.RankingResponse;
import br.ufrpe.ewaster.user.dto.UsuarioResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
private PasswordEncoder passwordEncoder;

    // Lista de usuários para o painel administrativo (somente ADMIN — ver SecurityConfig).
    // Usa DTO sem senha.
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        List<UsuarioResponse> usuarios = userRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/me")
public ResponseEntity<UsuarioResponse> obterUsuarioLogado(Authentication authentication) {
    String email = authentication.getName();

    User usuario = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    return ResponseEntity.ok(UsuarioResponse.from(usuario));
}

@PutMapping("/me")
public ResponseEntity<UsuarioResponse> atualizarUsuarioLogado(
        Authentication authentication,
        @RequestBody AtualizarUsuarioRequest request
) {
    String emailAtual = authentication.getName();

    User usuario = userRepository.findByEmail(emailAtual)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    if (request.getNome() != null && !request.getNome().trim().isEmpty()) {
        usuario.setNome(request.getNome().trim());
    }

    if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
        String novoEmail = request.getEmail().trim();

        if (!novoEmail.equals(usuario.getEmail()) && userRepository.findByEmail(novoEmail).isPresent()) {
            throw new RuntimeException("E-mail já está em uso.");
        }

        usuario.setEmail(novoEmail);
    }

    if (request.getSenha() != null && !request.getSenha().trim().isEmpty()) {
        if (request.getSenha().length() < 6) {
            throw new RuntimeException("A senha deve ter pelo menos 6 caracteres.");
        }

        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
    }

    User atualizado = userRepository.save(usuario);

    return ResponseEntity.ok(UsuarioResponse.from(atualizado));
}

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponse>> obterRanking() {
        // DTO seguro: ordena por pontuação desc e nunca expõe email/senha.
        List<RankingResponse> ranking = userRepository.findAll().stream()
                .sorted((a, b) -> {
                    int ptsA = a.getPontuacaoTotal() != null ? a.getPontuacaoTotal() : 0;
                    int ptsB = b.getPontuacaoTotal() != null ? b.getPontuacaoTotal() : 0;
                    return Integer.compare(ptsB, ptsA);
                })
                .map(RankingResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ranking);
    }
}
