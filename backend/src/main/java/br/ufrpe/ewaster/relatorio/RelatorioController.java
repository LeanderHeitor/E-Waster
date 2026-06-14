package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.user.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

// Relatorios administrativos (RF14/RF15/RF16). Acesso restrito a ADMIN no SecurityConfig
// (/api/v1/relatorios/**); CORS vem do CorsConfig global. Toda agregacao no RelatorioService.
@RestController
@RequestMapping("/api/v1/relatorios")
public class RelatorioController {

    private final UserRepository userRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final RelatorioService relatorioService;

    public RelatorioController(UserRepository userRepository,
                               AgendamentoRepository agendamentoRepository,
                               RelatorioService relatorioService) {
        this.userRepository = userRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.relatorioService = relatorioService;
    }

    // RF14 — Engajamento: totais por status, pontos distribuidos e resumo por usuario.
    @GetMapping("/engajamento")
    public ResponseEntity<Map<String, Object>> relatorioEngajamento() {
        return ResponseEntity.ok(relatorioService.engajamento(
                userRepository.findAll(), agendamentoRepository.findAll()));
    }

    // Quantidade/pontos por tipo de residuo dos agendamentos realizados.
    @GetMapping("/residuos")
    public ResponseEntity<Map<String, Object>> relatorioResiduos() {
        return ResponseEntity.ok(
                relatorioService.residuosRealizados(agendamentoRepository.findAll()));
    }

    // RF15/RF16 — Descartes/pontos agregados num periodo (datas inclusivas).
    @GetMapping("/descartes")
    public ResponseEntity<?> relatorioDescartesPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        if (fim.isBefore(inicio)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", "A data final não pode ser anterior à data inicial."));
        }
        return ResponseEntity.ok(relatorioService.descartesPorPeriodo(inicio, fim));
    }
}
