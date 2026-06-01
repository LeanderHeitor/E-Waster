package br.ufrpe.ewaster.agendamento;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/agendamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class AgendamentoController {

    private final AgendamentoService service;

    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    // Cancela (soft) um agendamento do proprio usuario.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelar(@PathVariable Integer id, Principal principal) {

        AgendamentoService.ResultadoCancelamento resultado =
                service.cancelar(id, principal.getName());

        return switch (resultado) {
            case OK -> ResponseEntity.noContent().build();
            case NAO_ENCONTRADO -> ResponseEntity.status(404).body("Agendamento nao encontrado");
            case NAO_DONO -> ResponseEntity.status(403).body("Voce nao pode cancelar este agendamento");
        };
    }
}
