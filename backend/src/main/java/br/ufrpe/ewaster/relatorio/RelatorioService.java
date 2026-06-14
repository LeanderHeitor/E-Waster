package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.descarte.Descarte;
import br.ufrpe.ewaster.descarte.DescarteRepository;
import br.ufrpe.ewaster.user.TipoUsuario;
import br.ufrpe.ewaster.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Agregacoes dos relatorios administrativos (RF14/RF15/RF16). As regras ficam em
 * metodos puros (recebem as listas, sem Spring/DB) para permitir teste unitario direto.
 */
@Service
public class RelatorioService {

    private final DescarteRepository descarteRepository;

    public RelatorioService(DescarteRepository descarteRepository) {
        this.descarteRepository = descarteRepository;
    }

    // RF14 — Engajamento geral: totais por status, pontos distribuidos e um resumo por
    // usuario. Admins entram so na soma de pontos; nos totais e na lista contam os comuns.
    public Map<String, Object> engajamento(List<User> usuarios, List<Agendamento> agendamentos) {
        List<User> comuns = usuarios.stream()
                .filter(u -> u.getTipo() != null && u.getTipo() != TipoUsuario.ADMIN)
                .toList();

        List<Map<String, Object>> usuariosResumo = comuns.stream()
                .map(u -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", u.getId());
                    item.put("nome", u.getNome());
                    item.put("email", u.getEmail());
                    item.put("pontuacaoTotal", pontos(u));
                    item.put("totalAgendamentos", agendamentos.stream()
                            .filter(a -> a.getUsuario().getId().equals(u.getId()))
                            .count());
                    return item;
                })
                .toList();

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("totalUsuarios", (long) comuns.size());
        resposta.put("totalAgendamentos", (long) agendamentos.size());
        resposta.put("pendentes", contarStatus(agendamentos, StatusAgendamento.PENDENTE));
        resposta.put("realizados", contarStatus(agendamentos, StatusAgendamento.REALIZADO));
        resposta.put("cancelados", contarStatus(agendamentos, StatusAgendamento.CANCELADO));
        resposta.put("naoCompareceu", contarStatus(agendamentos, StatusAgendamento.NAO_COMPARECEU));
        resposta.put("pontosDistribuidos", usuarios.stream().mapToInt(RelatorioService::pontos).sum());
        resposta.put("usuarios", usuariosResumo);
        return resposta;
    }

    // Quantidade e pontos por tipo de residuo, considerando apenas agendamentos REALIZADOS.
    public Map<String, Object> residuosRealizados(List<Agendamento> agendamentos) {
        Map<String, Map<String, Object>> porResiduo = new LinkedHashMap<>();
        int quantidadeTotal = 0;
        int pontosGerados = 0;

        for (Agendamento agendamento : agendamentos) {
            if (agendamento.getStatus() != StatusAgendamento.REALIZADO) {
                continue;
            }
            for (AgendamentoItem item : agendamento.getItens()) {
                String nome = item.getTipoResiduo().getNome();
                int quantidade = item.getQuantidade() != null ? item.getQuantidade() : 0;
                int pontos = quantidade * item.getTipoResiduo().getPontuacaoBase();

                quantidadeTotal += quantidade;
                pontosGerados += pontos;

                porResiduo.putIfAbsent(nome, new LinkedHashMap<>());
                Map<String, Object> resumo = porResiduo.get(nome);
                resumo.put("tipoResiduo", nome);
                resumo.put("quantidadeTotal", ((Integer) resumo.getOrDefault("quantidadeTotal", 0)) + quantidade);
                resumo.put("pontosGerados", ((Integer) resumo.getOrDefault("pontosGerados", 0)) + pontos);
            }
        }

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("quantidadeTotal", quantidadeTotal);
        resposta.put("pontosGerados", pontosGerados);
        resposta.put("residuos", new ArrayList<>(porResiduo.values()));
        return resposta;
    }

    private static long contarStatus(List<Agendamento> agendamentos, StatusAgendamento status) {
        return agendamentos.stream().filter(a -> a.getStatus() == status).count();
    }

    private static int pontos(User u) {
        return u.getPontuacaoTotal() != null ? u.getPontuacaoTotal() : 0;
    }

    // Busca os descartes do periodo [inicio, fim] (datas inclusivas) e os agrega.
    public Map<String, Object> descartesPorPeriodo(LocalDate inicio, LocalDate fim) {
        // Janela [inicio 00:00, fim+1 00:00): fim exclusivo para incluir o dia 'fim' por completo.
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime fimDt = fim.plusDays(1).atStartOfDay();

        List<Descarte> descartes = descarteRepository.findNoPeriodo(inicioDt, fimDt);
        return agregar(descartes, inicio, fim);
    }

    // Agregacao pura: conta descartes, soma unidades e pontos, e detalha por tipo de
    // residuo. Recebe a lista pronta -> testavel sem banco nem contexto Spring.
    public Map<String, Object> agregar(List<Descarte> descartes, LocalDate inicio, LocalDate fim) {
        Map<String, Map<String, Object>> porResiduo = new LinkedHashMap<>();
        int quantidadeTotal = 0;
        int pontosGerados = 0;

        for (Descarte d : descartes) {
            String nome = d.getTipoResiduo().getNome();
            int quantidade = quantidadeDoDescarte(d);
            int pontos = d.getTipoResiduo().getPontuacaoBase() * quantidade;

            quantidadeTotal += quantidade;
            pontosGerados += pontos;

            porResiduo.putIfAbsent(nome, new LinkedHashMap<>());
            Map<String, Object> resumo = porResiduo.get(nome);
            resumo.put("tipoResiduo", nome);
            resumo.put("descartes", ((Integer) resumo.getOrDefault("descartes", 0)) + 1);
            resumo.put("quantidadeTotal", ((Integer) resumo.getOrDefault("quantidadeTotal", 0)) + quantidade);
            resumo.put("pontosGerados", ((Integer) resumo.getOrDefault("pontosGerados", 0)) + pontos);
        }

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("inicio", inicio.toString());
        resposta.put("fim", fim.toString());
        resposta.put("totalDescartes", descartes.size());
        resposta.put("quantidadeTotal", quantidadeTotal);
        resposta.put("pontosGerados", pontosGerados);
        resposta.put("residuos", new ArrayList<>(porResiduo.values()));
        return resposta;
    }

    // A quantidade real do descarte vive no AgendamentoItem do mesmo tipo de residuo
    // (o Descarte guarda so o tipo). Sem item correspondente, conta como 1 unidade.
    static int quantidadeDoDescarte(Descarte d) {
        return d.getAgendamento().getItens().stream()
                .filter(i -> Objects.equals(i.getTipoResiduo().getId(), d.getTipoResiduo().getId()))
                .map(AgendamentoItem::getQuantidade)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(1);
    }
}
