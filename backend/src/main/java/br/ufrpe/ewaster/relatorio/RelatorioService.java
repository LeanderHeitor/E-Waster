package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.descarte.Descarte;
import br.ufrpe.ewaster.descarte.DescarteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Regras do relatorio de descartes/pontos por periodo (RF15/RF16). A agregacao
 * fica isolada em {@link #agregar} (sem Spring/DB) para permitir teste unitario direto.
 */
@Service
public class RelatorioService {

    private final DescarteRepository descarteRepository;

    public RelatorioService(DescarteRepository descarteRepository) {
        this.descarteRepository = descarteRepository;
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
