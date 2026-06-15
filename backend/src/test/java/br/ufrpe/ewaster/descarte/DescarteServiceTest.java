package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.AgendamentoService;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoItemRequest;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
import br.ufrpe.ewaster.campanha.Campanha;
import br.ufrpe.ewaster.campanha.CampanhaRepository;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.slot.SlotColetaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

// Cobre o fluxo de descarte (aprovar agendamento -> soma pontos -> REALIZADO).
@SpringBootTest
@Transactional // rollback automatico
class DescarteServiceTest {

    @Autowired DescarteService descarteService;
    @Autowired AgendamentoService agendamentoService;
    @Autowired AgendamentoRepository agendamentoRepository;
    @Autowired SlotColetaRepository slotRepository;
    @Autowired TipoResiduoRepository tipoResiduoRepository;
    @Autowired UserRepository userRepository;
    @Autowired CampanhaRepository campanhaRepository;

    // Data bem no futuro: além de passar na trava de "horário já passou", garante que
    // nenhuma campanha criada hoje (no banco de dev) atrapalhe os asserts de pontos.
    private static final LocalDate DATA_FUTURA = LocalDate.now().plusYears(5);

    // Slot sempre futuro: não depende do seed (que vence) e passa na trava de "horário já passou".
    private Integer primeiroSlotId() {
        SlotColeta s = new SlotColeta();
        s.setData(DATA_FUTURA);
        s.setHorarioInicio(LocalTime.of(8, 0));
        s.setHorarioFim(LocalTime.of(12, 0));
        s.setCapacidadeMaxima(5);
        s.setAtivo(true);
        return slotRepository.save(s).getId();
    }

    private TipoResiduo primeiroTipo() {
        return tipoResiduoRepository.findAll().get(0);
    }

    private Agendamento criarPendente(String email, int qtd) {
        userRepository.save(new User("Teste", email, "x"));
        AgendamentoRequest req = new AgendamentoRequest(
                primeiroSlotId(),
                List.of(new AgendamentoItemRequest(primeiroTipo().getId(), qtd)));
        return agendamentoService.criarAgendamento(req, email);
    }

    @Test
    void aprovar_somaPontos_eMarcaRealizado() {
        int qtd = 3;
        int base = primeiroTipo().getPontuacaoBase();
        Agendamento ag = criarPendente("aprovar@teste.dev", qtd);

        int novoTotal = descarteService.aprovarAgendamento(ag.getId());

        assertEquals(base * qtd, novoTotal, "pontos = pontuacao_base * quantidade");
        assertEquals(StatusAgendamento.REALIZADO,
                agendamentoRepository.findById(ag.getId()).orElseThrow().getStatus());
        assertEquals(base * qtd,
                userRepository.findByEmail("aprovar@teste.dev").orElseThrow().getPontuacaoTotal());
    }

    @Test
    void aprovar_comCampanhaGeralVigente_aplicaMultiplicador() {
        int qtd = 2;
        int base = primeiroTipo().getPontuacaoBase();

        // Campanha "geral" (sem tipo) com multiplicador 2x, vigente na data do slot.
        Campanha campanha = new Campanha(
                "Mutirão E-lixo",
                DATA_FUTURA.minusDays(1),
                DATA_FUTURA.plusDays(1),
                2.0);
        campanhaRepository.save(campanha);

        Agendamento ag = criarPendente("campanha@teste.dev", qtd);

        int novoTotal = descarteService.aprovarAgendamento(ag.getId());

        assertEquals(base * qtd * 2, novoTotal,
                "pontos = pontuacao_base * quantidade * multiplicador da campanha");
    }

    @Test
    void aprovar_comMultiplicadorFracionario_aplicaBonus() {
        int qtd = 2;
        int base = primeiroTipo().getPontuacaoBase();
        double multiplicador = 1.5;

        // Campanha geral com multiplicador fracionário (1.5x) — pontos arredondados.
        Campanha campanha = new Campanha(
                "Black Friday do E-lixo",
                DATA_FUTURA.minusDays(1),
                DATA_FUTURA.plusDays(1),
                multiplicador);
        campanhaRepository.save(campanha);

        Agendamento ag = criarPendente("campanha-frac@teste.dev", qtd);

        int novoTotal = descarteService.aprovarAgendamento(ag.getId());

        assertEquals((int) Math.round(base * qtd * multiplicador), novoTotal,
                "multiplicador fracionário (1.5x) deve bonificar os pontos");
    }

    @Test
    void aprovar_comCampanhaDeOutroTipo_naoAplicaMultiplicador() {
        int qtd = 2;
        int base = primeiroTipo().getPontuacaoBase();

        // Campanha restrita a um tipo diferente do item -> não bonifica.
        int outroTipoId = tipoResiduoRepository.findAll().stream()
                .map(TipoResiduo::getId)
                .filter(id -> !id.equals(primeiroTipo().getId()))
                .findFirst()
                .orElseThrow();

        Campanha campanha = new Campanha(
                "Só baterias",
                DATA_FUTURA.minusDays(1),
                DATA_FUTURA.plusDays(1),
                3.0);
        campanha.setTipoResiduo(tipoResiduoRepository.findById(outroTipoId).orElseThrow());
        campanhaRepository.save(campanha);

        Agendamento ag = criarPendente("campanha-outro@teste.dev", qtd);

        int novoTotal = descarteService.aprovarAgendamento(ag.getId());

        assertEquals(base * qtd, novoTotal,
                "campanha de outro tipo não deve bonificar este descarte");
    }

    @Test
    void aprovar_naoPendente_lancaErro() {
        Agendamento ag = criarPendente("dupla@teste.dev", 1);
        descarteService.aprovarAgendamento(ag.getId()); // vira REALIZADO

        // segunda aprovacao do mesmo agendamento deve falhar
        assertThrows(RuntimeException.class,
                () -> descarteService.aprovarAgendamento(ag.getId()));
    }

    @Test
    void aprovar_inexistente_lancaErro() {
        assertThrows(RuntimeException.class,
                () -> descarteService.aprovarAgendamento(999999));
    }
}
