package br.ufrpe.ewaster.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/ranking")
    public ResponseEntity<List<User>> obterRanking() {
        List<User> usuarios = userRepository.findAll();

        // Ordena do maior número de pontos para o menor de forma segura
        usuarios.sort((a, b) -> {
            Integer ptsA = a.getPontuacaoTotal() != null ? a.getPontuacaoTotal() : 0;
            Integer ptsB = b.getPontuacaoTotal() != null ? b.getPontuacaoTotal() : 0;
            return ptsB.compareTo(ptsA);
        });

        return ResponseEntity.ok(usuarios);
    }
}