package br.ufrpe.ewaster.agendamento;

import br.ufrpe.ewaster.agendamento.dto.AgendamentoItemRequest;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.slot.SlotColetaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

// Cobre #1 (POST/criar + regra de vaga) e #7 (cancelar com posse) do AgendamentoService integrado.
@SpringBootTest
@Transactional // rollback automatico
class AgendamentoServiceTest {

    @Autowired AgendamentoService service;
    @Autowired AgendamentoRepository agendamentoRepository;
    @Autowired SlotColetaRepository slotRepository;
    @Autowired TipoResiduoRepository tipoResiduoRepository;
    @Autowired UserRepository userRepository;

    private User novoUsuario(String email) {
        return userRepository.save(new User("Teste", email, "x"));
    }

    private Integer primeiroSlotId() {
        return slotRepository.findAllByAtivoTrueOrderByDataAscHorarioInicioAsc().get(0).getId();
    }

    private Integer primeiroTipoId() {
        return tipoResiduoRepository.findAll().get(0).getId();
    }

    private AgendamentoRequest reqComUmItem(Integer slotId) {
        return new AgendamentoRequest(slotId, List.of(new AgendamentoItemRequest(primeiroTipoId(), 1)));
    }

    @Test
    void criar_persisteAgendamentoComItens() {
        novoUsuario("criar@teste.dev");
        AgendamentoRequest req = new AgendamentoRequest(
                primeiroSlotId(),
                List.of(new AgendamentoItemRequest(primeiroTipoId(), 2)));

        Agendamento ag = service.criarAgendamento(req, "criar@teste.dev");

        assertNotNull(ag.getId());
        assertEquals(StatusAgendamento.PENDENTE, ag.getStatus());
        assertEquals(1, ag.getItens().size());
        assertEquals(2, ag.getItens().get(0).getQuantidade());
    }

    @Test
    void criar_slotCheio_lancaErro() {
        SlotColeta slot = slotRepository.findById(primeiroSlotId()).orElseThrow();
        int capacidade = slot.getCapacidadeMaxima();

        // preenche o slot ate a capacidade
        for (int i = 0; i < capacidade; i++) {
            String email = "lota" + i + "@teste.dev";
            novoUsuario(email);
            service.criarAgendamento(reqComUmItem(slot.getId()), email);
        }

        // o proximo deve estourar
        novoUsuario("estouro@teste.dev");
        assertThrows(RuntimeException.class,
                () -> service.criarAgendamento(reqComUmItem(slot.getId()), "estouro@teste.dev"));
    }

    @Test
    void cancelar_peloDono_marcaComoCancelado() {
        novoUsuario("dono1@teste.dev");
        Agendamento ag = service.criarAgendamento(reqComUmItem(primeiroSlotId()), "dono1@teste.dev");

        service.cancelarAgendamento(ag.getId(), "dono1@teste.dev");

        assertEquals(StatusAgendamento.CANCELADO,
                agendamentoRepository.findById(ag.getId()).orElseThrow().getStatus());
    }

    @Test
    void cancelar_porNaoDono_lancaErro_eNaoCancela() {
        novoUsuario("dono2@teste.dev");
        Agendamento ag = service.criarAgendamento(reqComUmItem(primeiroSlotId()), "dono2@teste.dev");

        assertThrows(RuntimeException.class,
                () -> service.cancelarAgendamento(ag.getId(), "intruso@teste.dev"));
        assertEquals(StatusAgendamento.PENDENTE,
                agendamentoRepository.findById(ag.getId()).orElseThrow().getStatus());
    }

    @Test
    void cancelar_inexistente_lancaErro() {
        assertThrows(RuntimeException.class,
                () -> service.cancelarAgendamento(999999, "qualquer@teste.dev"));
    }
}
