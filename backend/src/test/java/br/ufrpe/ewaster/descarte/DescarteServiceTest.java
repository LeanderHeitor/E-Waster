package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.AgendamentoService;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoItemRequest;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
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

    // Slot sempre futuro: não depende do seed (que vence) e passa na trava de "horário já passou".
    private Integer primeiroSlotId() {
        SlotColeta s = new SlotColeta();
        s.setData(LocalDate.now().plusDays(7));
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
