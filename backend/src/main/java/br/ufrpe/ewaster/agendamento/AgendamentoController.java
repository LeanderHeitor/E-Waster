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
import br.ufrpe.ewaster.campanha.Campanha;
import br.ufrpe.ewaster.campanha.CampanhaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/agendamentos")
public class AgendamentoController {

    private final AgendamentoRepository agendamentoRepository;
    private final AgendamentoService agendamentoService; // Injetando o service criado
    private final CampanhaRepository campanhaRepository;

    public AgendamentoController(AgendamentoRepository agendamentoRepository,
                             AgendamentoService agendamentoService,
                             CampanhaRepository campanhaRepository) {
    this.agendamentoRepository = agendamentoRepository;
    this.agendamentoService = agendamentoService;
    this.campanhaRepository = campanhaRepository;
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
        int totalPts = calcularTotalPtsComCampanha(a);

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

        return new AgendamentoResponse(a.getId(), a.getStatus().name(), totalPts, slotDTO, itensDTO);
    }

    // Versão admin: inclui o dono do agendamento.
    private AgendamentoAdminResponse toAdminResponse(Agendamento a) {
        int totalPts = calcularTotalPtsComCampanha(a);

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
    private int calcularTotalPtsComCampanha(Agendamento a) {
    LocalDate hoje = LocalDate.now();

    List<Campanha> campanhasAtivas = campanhaRepository
            .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(hoje, hoje);

    return a.getItens().stream()
            .mapToInt(item -> {
                TipoResiduo tipo = item.getTipoResiduo();
                int qtd = item.getQuantidade() != null ? item.getQuantidade() : 1;
                int pontosBase = tipo.getPontuacaoBase() * qtd;
                double multiplicador = obterMaiorMultiplicadorAplicavel(tipo, campanhasAtivas);
                return (int) Math.round(pontosBase * multiplicador);
            })
            .sum();
}

private double obterMaiorMultiplicadorAplicavel(TipoResiduo tipo, List<Campanha> campanhasAtivas) {
    double maiorMultiplicador = 1.0;

    for (Campanha campanha : campanhasAtivas) {
        Double multiplicador = campanha.getMultiplicador() != null
                ? campanha.getMultiplicador()
                : 1.0;

        boolean campanhaGlobal = campanha.getTipoResiduo() == null;

        boolean campanhaDoTipo =
                campanha.getTipoResiduo() != null &&
                campanha.getTipoResiduo().getId().equals(tipo.getId());

        if ((campanhaGlobal || campanhaDoTipo) && multiplicador > maiorMultiplicador) {
            maiorMultiplicador = multiplicador;
        }
    }

    return maiorMultiplicador;
}
}
