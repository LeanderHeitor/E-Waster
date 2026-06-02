package br.ufrpe.ewaster.user;

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

    // Lista de usuários para o painel administrativo (somente ADMIN — ver SecurityConfig).
    // Usa DTO sem senha.
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        List<UsuarioResponse> usuarios = userRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(usuarios);
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
