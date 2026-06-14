package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.descarte.Descarte;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.user.TipoUsuario;
import br.ufrpe.ewaster.user.User;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Teste unitario PURO do RelatorioService: sem Spring, sem banco, sem mocks.
// Monta as entidades em memoria e valida as agregacoes dos relatorios.
class RelatorioServiceTest {

    // As agregacoes nao usam o repositorio, entao podemos passar null com seguranca.
    private final RelatorioService service = new RelatorioService(null);

    // ===== descartes por periodo (RF15/RF16) =====

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

    // ===== engajamento (RF14) =====

    @Test
    void engajamento_contaPorStatus_ignoraAdminNosTotais_eSomaPontos() {
        User comum = user(1, "Ana", "ana@x.dev", TipoUsuario.USUARIO, 30);
        User admin = user(2, "Root", "root@x.dev", TipoUsuario.ADMIN, 0);

        // 3 agendamentos da Ana em status diferentes; admin sem agendamentos.
        Agendamento pendente = agendamentoDe(comum, StatusAgendamento.PENDENTE);
        Agendamento realizado = agendamentoDe(comum, StatusAgendamento.REALIZADO);
        Agendamento cancelado = agendamentoDe(comum, StatusAgendamento.CANCELADO);

        Map<String, Object> resp = service.engajamento(
                List.of(comum, admin), List.of(pendente, realizado, cancelado));

        assertEquals(1L, resp.get("totalUsuarios"), "admin nao conta nos totais");
        assertEquals(3L, resp.get("totalAgendamentos"));
        assertEquals(1L, resp.get("pendentes"));
        assertEquals(1L, resp.get("realizados"));
        assertEquals(1L, resp.get("cancelados"));
        assertEquals(0L, resp.get("naoCompareceu"));
        assertEquals(30, resp.get("pontosDistribuidos"));

        List<Map<String, Object>> usuarios = mapas(resp.get("usuarios"));
        assertEquals(1, usuarios.size(), "admin nao aparece na lista de usuarios");
        assertEquals("Ana", usuarios.get(0).get("nome"));
        assertEquals(30, usuarios.get(0).get("pontuacaoTotal"));
        assertEquals(3L, usuarios.get(0).get("totalAgendamentos"));
    }

    // ===== residuos realizados =====

    @Test
    void residuos_somaPorTipo_ignoraNaoRealizados() {
        TipoResiduo celular = tipo(1, "Celular", 15);
        TipoResiduo pilha = tipo(2, "Pilha", 5);

        Agendamento realizado = agendamentoCom(item(celular, 2), item(pilha, 3));
        realizado.setStatus(StatusAgendamento.REALIZADO);

        Agendamento pendente = agendamentoCom(item(celular, 10)); // ignorado: nao REALIZADO
        pendente.setStatus(StatusAgendamento.PENDENTE);

        Map<String, Object> resp = service.residuosRealizados(List.of(realizado, pendente));

        assertEquals(5, resp.get("quantidadeTotal"), "soma 2+3; o pendente eh ignorado");
        assertEquals(15 * 2 + 5 * 3, resp.get("pontosGerados"));  // 45
        assertEquals(2, residuos(resp).size());
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

    private static Agendamento agendamentoDe(User dono, StatusAgendamento status) {
        Agendamento ag = new Agendamento();
        ag.setUsuario(dono);
        ag.setStatus(status);
        return ag;
    }

    private static Descarte descarte(TipoResiduo tipo, Agendamento ag) {
        return new Descarte(null, tipo, ag);
    }

    private static User user(int id, String nome, String email, TipoUsuario tipo, int pontos) {
        User u = new User(nome, email, "x");
        u.setTipo(tipo);
        u.setPontuacaoTotal(pontos);
        setId(u, id);
        return u;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> mapas(Object valor) {
        return (List<Map<String, Object>>) valor;
    }

    private static List<Map<String, Object>> residuos(Map<String, Object> resp) {
        return mapas(resp.get("residuos"));
    }

    // id de TipoResiduo/User e @GeneratedValue (sem setter) -> define via reflexao so no teste.
    private static void setId(TipoResiduo t, int id) {
        setId((Object) t, TipoResiduo.class, id);
    }

    private static void setId(User u, int id) {
        setId((Object) u, User.class, id);
    }

    private static void setId(Object alvo, Class<?> classe, int id) {
        try {
            Field f = classe.getDeclaredField("id");
            f.setAccessible(true);
            f.set(alvo, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
