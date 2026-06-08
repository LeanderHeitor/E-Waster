package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/relatorios")
@CrossOrigin(origins = "http://localhost:5173")
public class RelatorioController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/engajamento")
    public ResponseEntity<Map<String, Object>> relatorioEngajamento() {
        List<User> usuarios = userRepository.findAll();
        List<Agendamento> agendamentos = agendamentoRepository.findAll();

        long totalUsuarios = usuarios.stream()
                .filter(u -> u.getTipo() != null && !"ADMIN".equals(u.getTipo().name()))
                .count();

        long totalAgendamentos = agendamentos.size();

        long pendentes = agendamentos.stream()
                .filter(a -> a.getStatus() == StatusAgendamento.PENDENTE)
                .count();

        long realizados = agendamentos.stream()
                .filter(a -> a.getStatus() == StatusAgendamento.REALIZADO)
                .count();

        long cancelados = agendamentos.stream()
                .filter(a -> a.getStatus() == StatusAgendamento.CANCELADO)
                .count();

        long naoCompareceu = agendamentos.stream()
                .filter(a -> a.getStatus() == StatusAgendamento.NAO_COMPARECEU)
                .count();

        int pontosDistribuidos = usuarios.stream()
                .mapToInt(u -> u.getPontuacaoTotal() != null ? u.getPontuacaoTotal() : 0)
                .sum();

        List<Map<String, Object>> usuariosResumo = usuarios.stream()
                .filter(u -> u.getTipo() != null && !"ADMIN".equals(u.getTipo().name()))
                .map(u -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", u.getId());
                    item.put("nome", u.getNome());
                    item.put("email", u.getEmail());
                    item.put("pontuacaoTotal", u.getPontuacaoTotal() != null ? u.getPontuacaoTotal() : 0);

                    long agendamentosUsuario = agendamentos.stream()
                            .filter(a -> a.getUsuario().getId().equals(u.getId()))
                            .count();

                    item.put("totalAgendamentos", agendamentosUsuario);
                    return item;
                })
                .toList();

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("totalUsuarios", totalUsuarios);
        resposta.put("totalAgendamentos", totalAgendamentos);
        resposta.put("pendentes", pendentes);
        resposta.put("realizados", realizados);
        resposta.put("cancelados", cancelados);
        resposta.put("naoCompareceu", naoCompareceu);
        resposta.put("pontosDistribuidos", pontosDistribuidos);
        resposta.put("usuarios", usuariosResumo);

        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/residuos")
    public ResponseEntity<Map<String, Object>> relatorioResiduos() {
        List<Agendamento> agendamentos = agendamentoRepository.findAll();

        Map<String, Map<String, Object>> residuos = new LinkedHashMap<>();

        for (Agendamento agendamento : agendamentos) {
            if (agendamento.getStatus() != StatusAgendamento.REALIZADO) {
                continue;
            }

            for (AgendamentoItem item : agendamento.getItens()) {
                String nome = item.getTipoResiduo().getNome();
                int quantidade = item.getQuantidade() != null ? item.getQuantidade() : 0;
                int pontos = quantidade * item.getTipoResiduo().getPontuacaoBase();

                residuos.putIfAbsent(nome, new LinkedHashMap<>());
                Map<String, Object> resumo = residuos.get(nome);

                resumo.put("tipoResiduo", nome);
                resumo.put("quantidadeTotal", ((Integer) resumo.getOrDefault("quantidadeTotal", 0)) + quantidade);
                resumo.put("pontosGerados", ((Integer) resumo.getOrDefault("pontosGerados", 0)) + pontos);
            }
        }

        List<Map<String, Object>> lista = new ArrayList<>(residuos.values());

        int quantidadeTotal = lista.stream()
                .mapToInt(r -> (Integer) r.get("quantidadeTotal"))
                .sum();

        int pontosGerados = lista.stream()
                .mapToInt(r -> (Integer) r.get("pontosGerados"))
                .sum();

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("quantidadeTotal", quantidadeTotal);
        resposta.put("pontosGerados", pontosGerados);
        resposta.put("residuos", lista);

        return ResponseEntity.ok(resposta);
    }

    // RF15/RF16 — Relatorio que agrega descartes e pontos dentro de um periodo (datas inclusivas).
    // Restrito a ADMIN no SecurityConfig (/api/v1/relatorios/**). Agregacao em RelatorioService.
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
