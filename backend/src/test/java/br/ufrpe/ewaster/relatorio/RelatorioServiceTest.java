package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.descarte.Descarte;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Teste unitario PURO do RelatorioService.agregar: sem Spring, sem banco, sem mocks.
// Monta as entidades em memoria e valida a agregacao de descartes/pontos por periodo.
class RelatorioServiceTest {

    // agregar() nao usa o repositorio, entao podemos passar null com seguranca.
    private final RelatorioService service = new RelatorioService(null);

    @Test
    void agrega_doisTipos_somaUnidadesEPontos() {
        TipoResiduo celular = tipo(1, "Celular", 15);
        TipoResiduo pilha = tipo(2, "Pilha", 5);

        // Um agendamento com 2 celulares e 3 pilhas -> 2 descartes (um por tipo).
        Agendamento ag = agendamentoCom(item(celular, 2), item(pilha, 3));
        List<Descarte> descartes = List.of(descarte(celular, ag), descarte(pilha, ag));

        Map<String, Object> resp = service.agregar(descartes, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30));

        assertEquals(2, resp.get("totalDescartes"));
        assertEquals(5, resp.get("quantidadeTotal"));             // 2 + 3
        assertEquals(15 * 2 + 5 * 3, resp.get("pontosGerados"));  // 45
        assertEquals("2026-06-01", resp.get("inicio"));
        assertEquals("2026-06-30", resp.get("fim"));
        assertEquals(2, residuos(resp).size());
    }

    @Test
    void agrega_mesmoTipoEmDoisAgendamentos_juntaNaMesmaLinha() {
        TipoResiduo celular = tipo(1, "Celular", 15);

        Agendamento ag1 = agendamentoCom(item(celular, 2));
        Agendamento ag2 = agendamentoCom(item(celular, 1));
        List<Descarte> descartes = List.of(descarte(celular, ag1), descarte(celular, ag2));

        Map<String, Object> resp = service.agregar(descartes, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 7));

        assertEquals(2, resp.get("totalDescartes"));
        assertEquals(3, resp.get("quantidadeTotal"));     // 2 + 1
        assertEquals(15 * 3, resp.get("pontosGerados"));  // 45

        List<Map<String, Object>> residuos = residuos(resp);
        assertEquals(1, residuos.size(), "mesmo tipo deve ser agregado numa linha so");
        Map<String, Object> linha = residuos.get(0);
        assertEquals("Celular", linha.get("tipoResiduo"));
        assertEquals(2, linha.get("descartes"));
        assertEquals(3, linha.get("quantidadeTotal"));
        assertEquals(45, linha.get("pontosGerados"));
    }

    @Test
    void agrega_listaVazia_zera() {
        Map<String, Object> resp = service.agregar(new ArrayList<>(), LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 7));

        assertEquals(0, resp.get("totalDescartes"));
        assertEquals(0, resp.get("quantidadeTotal"));
        assertEquals(0, resp.get("pontosGerados"));
        assertTrue(residuos(resp).isEmpty());
    }

    @Test
    void quantidade_semItemCorrespondente_contaComoUm() {
        TipoResiduo celular = tipo(1, "Celular", 15);
        TipoResiduo pilha = tipo(2, "Pilha", 5);

        // O agendamento so tem item de pilha, mas existe um descarte de celular sem item casado.
        Agendamento ag = agendamentoCom(item(pilha, 3));
        List<Descarte> descartes = List.of(descarte(celular, ag));

        Map<String, Object> resp = service.agregar(descartes, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 7));

        assertEquals(1, resp.get("totalDescartes"));
        assertEquals(1, resp.get("quantidadeTotal"));  // fallback = 1 unidade
        assertEquals(15, resp.get("pontosGerados"));   // 15 * 1
    }

    // ===== fabricas de entidades em memoria =====

    private static TipoResiduo tipo(int id, String nome, int base) {
        TipoResiduo t = new TipoResiduo();
        t.setNome(nome);
        t.setPontuacaoBase(base);
        setId(t, id);
        return t;
    }

    private static AgendamentoItem item(TipoResiduo tipo, int quantidade) {
        AgendamentoItem i = new AgendamentoItem();
        i.setTipoResiduo(tipo);
        i.setQuantidade(quantidade);
        return i;
    }

    private static Agendamento agendamentoCom(AgendamentoItem... itens) {
        Agendamento ag = new Agendamento();
        for (AgendamentoItem i : itens) {
            i.setAgendamento(ag);
            ag.getItens().add(i);
        }
        return ag;
    }

    private static Descarte descarte(TipoResiduo tipo, Agendamento ag) {
        return new Descarte(null, tipo, ag);
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> residuos(Map<String, Object> resp) {
        return (List<Map<String, Object>>) resp.get("residuos");
    }

    // TipoResiduo.id nao tem setter (e @GeneratedValue) -> define via reflexao so no teste.
    private static void setId(TipoResiduo t, int id) {
        try {
            Field f = TipoResiduo.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(t, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
