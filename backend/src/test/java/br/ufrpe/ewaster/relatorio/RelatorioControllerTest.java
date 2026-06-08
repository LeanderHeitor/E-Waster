package br.ufrpe.ewaster.relatorio;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoService;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoItemRequest;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
import br.ufrpe.ewaster.auth.service.JwtService;
import br.ufrpe.ewaster.descarte.DescarteService;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.slot.SlotColetaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;
import br.ufrpe.ewaster.user.TipoUsuario;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// RF15/RF16 — relatorio de descartes/pontos por periodo.
// Cobre os dois criterios de aceite: acesso restrito a ADMIN e agregacao por periodo.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional // rollback automatico
class RelatorioControllerTest {

    @Autowired MockMvc mvc;
    @Autowired RelatorioController controller;
    @Autowired JwtService jwtService;
    @Autowired UserRepository userRepository;
    @Autowired AgendamentoService agendamentoService;
    @Autowired DescarteService descarteService;
    @Autowired SlotColetaRepository slotRepository;
    @Autowired TipoResiduoRepository tipoResiduoRepository;

    private static final String ROTA = "/api/v1/relatorios/descartes?inicio=2026-06-01&fim=2026-06-07";

    private String tokenDe(String email, TipoUsuario tipo) {
        User u = new User("Teste " + tipo, email, "x");
        u.setTipo(tipo);
        userRepository.save(u);
        return jwtService.generateToken(email);
    }

    private TipoResiduo primeiroTipo() {
        return tipoResiduoRepository.findAll().get(0);
    }

    // Slot sempre futuro: passa na trava de "horário já passou" do AgendamentoService.
    private Integer slotFuturoId() {
        SlotColeta s = new SlotColeta();
        s.setData(LocalDate.now().plusDays(7));
        s.setHorarioInicio(LocalTime.of(8, 0));
        s.setHorarioFim(LocalTime.of(12, 0));
        s.setCapacidadeMaxima(5);
        s.setAtivo(true);
        return slotRepository.save(s).getId();
    }

    // Cria, aprova e devolve o agendamento (a aprovacao gera os descartes com data de hoje).
    private void criarEaprovar(String email, TipoResiduo tipo, int quantidade) {
        userRepository.save(new User("Dono", email, "x"));
        Agendamento ag = agendamentoService.criarAgendamento(
                new AgendamentoRequest(slotFuturoId(), List.of(new AgendamentoItemRequest(tipo.getId(), quantidade))),
                email);
        descarteService.aprovarAgendamento(ag.getId());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> corpoDoPeriodo(LocalDate inicio, LocalDate fim) {
        return (Map<String, Object>) controller.relatorioDescartesPorPeriodo(inicio, fim).getBody();
    }

    // ===== Criterio: acesso restrito a ADMIN =====

    @Test
    void getRelatorio_semToken_negado() throws Exception {
        mvc.perform(get(ROTA)).andExpect(status().isForbidden());
    }

    @Test
    void getRelatorio_usuarioComum_negado() throws Exception {
        String token = tokenDe("comum.rel@teste.dev", TipoUsuario.USUARIO);
        mvc.perform(get(ROTA).header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void getRelatorio_admin_ok() throws Exception {
        String token = tokenDe("admin.rel@teste.dev", TipoUsuario.ADMIN);
        mvc.perform(get(ROTA).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    // ===== Criterio: agrega descartes/pontos por periodo =====

    @Test
    void relatorio_agregaDescartesEPontos_noPeriodo() {
        LocalDate hoje = LocalDate.now();
        TipoResiduo tipo = primeiroTipo();

        Map<String, Object> antes = corpoDoPeriodo(hoje, hoje);
        int descartesAntes = (Integer) antes.get("totalDescartes");
        int qtdAntes = (Integer) antes.get("quantidadeTotal");
        int pontosAntes = (Integer) antes.get("pontosGerados");

        criarEaprovar("dono.rel@teste.dev", tipo, 2); // 1 descarte, 2 unidades

        Map<String, Object> depois = corpoDoPeriodo(hoje, hoje);
        assertEquals(descartesAntes + 1, (int) (Integer) depois.get("totalDescartes"),
                "deve contar +1 descarte no periodo");
        assertEquals(qtdAntes + 2, (int) (Integer) depois.get("quantidadeTotal"),
                "quantidade agregada deve somar +2 unidades");
        assertEquals(pontosAntes + tipo.getPontuacaoBase() * 2, (int) (Integer) depois.get("pontosGerados"),
                "pontos = pontuacao_base * quantidade");
    }

    @Test
    void relatorio_ignoraDescartesForaDoPeriodo() {
        LocalDate passadoIni = LocalDate.of(2000, 1, 1);
        LocalDate passadoFim = LocalDate.of(2000, 1, 2);

        int pontosAntes = (Integer) corpoDoPeriodo(passadoIni, passadoFim).get("pontosGerados");

        criarEaprovar("dono.fora@teste.dev", primeiroTipo(), 1); // descarte com data de hoje

        assertEquals(pontosAntes, (int) (Integer) corpoDoPeriodo(passadoIni, passadoFim).get("pontosGerados"),
                "um descarte de hoje nao pode entrar num periodo passado");
    }

    @Test
    void relatorio_periodoInvertido_badRequest() {
        var resposta = controller.relatorioDescartesPorPeriodo(
                LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 1));
        assertEquals(400, resposta.getStatusCode().value(),
                "data final anterior a inicial deve ser rejeitada");
    }
}
