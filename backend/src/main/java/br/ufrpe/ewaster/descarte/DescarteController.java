package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.descarte.dto.DescarteRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/descartes")
public class DescarteController {

    private final DescarteService descarteService;

    public DescarteController(DescarteService descarteService) {
        this.descarteService = descarteService;
    }

    // Apenas ADMIN (autorizado no SecurityConfig). Aprova o agendamento e soma os pontos.
    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody DescarteRequest request) {
        int novoTotal = descarteService.aprovarAgendamento(request.agendamentoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "agendamentoId", request.agendamentoId(),
                "pontuacaoTotal", novoTotal
        ));
    }
}
