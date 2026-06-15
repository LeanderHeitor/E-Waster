package br.ufrpe.ewaster.agendamento;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoResponse;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoAdminResponse;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/agendamentos")
public class AgendamentoController {

    private final AgendamentoRepository agendamentoRepository;
    private final AgendamentoService agendamentoService; // Injetando o service criado

    public AgendamentoController(AgendamentoRepository agendamentoRepository,
                                 AgendamentoService agendamentoService) {
        this.agendamentoRepository = agendamentoRepository;
        this.agendamentoService = agendamentoService;
    }

    // TAREFA 3: GET /agendamentos/me (Já integrado e usando seus métodos reais)
    @GetMapping("/me")
    public ResponseEntity<List<AgendamentoResponse>> listarMeusAgendamentos(Authentication authentication) {
        String emailUsuario = authentication.getName();
        List<AgendamentoResponse> resposta = agendamentoRepository.findAllByUsuarioEmail(emailUsuario)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(resposta);
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criarAgendamento(
            @RequestBody AgendamentoRequest request,
            Authentication authentication) {

        String emailUsuario = authentication.getName();

        // Chamando o service para validar e persistir pai e filhos
        Agendamento novoAgendamento = agendamentoService.criarAgendamento(request, emailUsuario);

        // Devolve um DTO (nao a entidade crua, que exporia o hash da senha do usuario)
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(novoAgendamento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarAgendamento(
            @PathVariable Integer id,
            Authentication authentication) {

        String emailUsuario = authentication.getName();
        agendamentoService.cancelarAgendamento(id, emailUsuario);

        return ResponseEntity.noContent().build(); // Status 204
    }

    // ===== Endpoints administrativos (somente ADMIN — ver SecurityConfig) =====

    // Lista todos os agendamentos pendentes de validação (de todos os usuários).
    @GetMapping("/pendentes")
    public ResponseEntity<List<AgendamentoAdminResponse>> listarPendentes() {
        List<AgendamentoAdminResponse> resposta = agendamentoRepository.findPendentesComUsuario()
                .stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(resposta);
    }

    // Recusa um agendamento pendente (marca NAO_COMPARECEU).
    @PatchMapping("/{id}/recusar")
    public ResponseEntity<Void> recusarAgendamento(@PathVariable Integer id) {
        agendamentoService.recusarAgendamento(id);
        return ResponseEntity.noContent().build();
    }

    // Converte a entidade no DTO de resposta (evita expor dados sensiveis do usuario).
    private AgendamentoResponse toResponse(Agendamento a) {
        // Aprovado: usa os pontos congelados (já com multiplicador de campanha), a mesma
        // fonte do ranking. Pendente/cancelado: mostra só a estimativa base * quantidade.
        int estimativaBase = a.getItens().stream()
                .mapToInt(item -> item.getTipoResiduo().getPontuacaoBase() * item.getQuantidade())
                .sum();
        int totalPts = a.getTotalPontos() != null ? a.getTotalPontos() : estimativaBase;

        var slotDTO = new AgendamentoResponse.SlotDTO(
                a.getSlot().getId(),
                a.getSlot().getData(),
                a.getSlot().getHorarioInicio(),
                a.getSlot().getHorarioFim()
        );

        var itensDTO = a.getItens().stream().map(item -> new AgendamentoResponse.ItemResponse(
                item.getId(),
                item.getTipoResiduo().getNome(),
                item.getQuantidade(),
                item.getTipoResiduo().getPontuacaoBase()
        )).collect(Collectors.toList());

        return new AgendamentoResponse(
                a.getId(),
                a.getStatus().name(),
                totalPts,
                estimativaBase,          // valor original (sem multiplicador)
                a.getMultiplicador(),    // multiplicador congelado (null se nunca aprovado)
                a.getCampanhaNome(),     // campanha que deu o bônus (null se não houve)
                slotDTO,
                itensDTO);
    }

    // Versão admin: inclui o dono do agendamento.
    private AgendamentoAdminResponse toAdminResponse(Agendamento a) {
        int totalPts = a.getItens().stream()
                .mapToInt(item -> item.getTipoResiduo().getPontuacaoBase() * item.getQuantidade())
                .sum();

        var u = a.getUsuario();
        var usuario = new AgendamentoAdminResponse.UsuarioMini(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getPontuacaoTotal() != null ? u.getPontuacaoTotal() : 0
        );

        var itens = a.getItens().stream().map(item -> new AgendamentoAdminResponse.ItemMini(
                item.getTipoResiduo().getNome(),
                item.getQuantidade(),
                item.getTipoResiduo().getPontuacaoBase()
        )).collect(Collectors.toList());

        return new AgendamentoAdminResponse(
                a.getId(),
                a.getStatus().name(),
                totalPts,
                String.valueOf(a.getSlot().getData()),
                usuario,
                itens
        );
    }
}
