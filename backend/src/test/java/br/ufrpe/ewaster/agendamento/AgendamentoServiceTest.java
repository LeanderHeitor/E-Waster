package br.ufrpe.ewaster.agendamento;

import br.ufrpe.ewaster.agendamento.AgendamentoService.ResultadoCancelamento;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.slot.SlotRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

// Cobre #7 (DELETE/cancelar) e a entidade AgendamentoItem do #9 (tabela do Furo 1).
@SpringBootTest
@Transactional // rollback automatico
class AgendamentoServiceTest {

    @Autowired AgendamentoService service;
    @Autowired AgendamentoRepository agendamentoRepository;
    @Autowired SlotRepository slotRepository;
    @Autowired UserRepository userRepository;
    @Autowired EntityManager em;

    private Agendamento criarPendente(String emailDono) {
        User dono = userRepository.save(new User("Dono", emailDono, "x"));
        SlotColeta slot = slotRepository.findById(1).orElseThrow();
        Agendamento ag = new Agendamento();
        ag.setUsuario(dono);
        ag.setSlot(slot);
        ag.setStatus(StatusAgendamento.PENDENTE);
        return agendamentoRepository.save(ag);
    }

    private StatusAgendamento statusNoBanco(Integer id) {
        return agendamentoRepository.findById(id).orElseThrow().getStatus();
    }

    @Test
    void cancelar_peloDono_marcaComoCancelado() {
        Agendamento ag = criarPendente("dono1@teste.dev");

        ResultadoCancelamento r = service.cancelar(ag.getId(), "dono1@teste.dev");

        assertEquals(ResultadoCancelamento.OK, r);
        assertEquals(StatusAgendamento.CANCELADO, statusNoBanco(ag.getId()));
    }

    @Test
    void cancelar_porNaoDono_naoCancela() {
        Agendamento ag = criarPendente("dono2@teste.dev");

        ResultadoCancelamento r = service.cancelar(ag.getId(), "intruso@teste.dev");

        assertEquals(ResultadoCancelamento.NAO_DONO, r);
        assertEquals(StatusAgendamento.PENDENTE, statusNoBanco(ag.getId()),
                "agendamento de outro usuario nao pode ser alterado");
    }

    @Test
    void cancelar_inexistente_retornaNaoEncontrado() {
        ResultadoCancelamento r = service.cancelar(999999, "qualquer@teste.dev");
        assertEquals(ResultadoCancelamento.NAO_ENCONTRADO, r);
    }

    @Test
    void cancelar_jaCancelado_ehIdempotente() {
        Agendamento ag = criarPendente("dono3@teste.dev");
        service.cancelar(ag.getId(), "dono3@teste.dev");

        ResultadoCancelamento r = service.cancelar(ag.getId(), "dono3@teste.dev");

        assertEquals(ResultadoCancelamento.OK, r);
        assertEquals(StatusAgendamento.CANCELADO, statusNoBanco(ag.getId()));
    }

    @Test
    void agendamentoItem_persisteLigandoAgendamentoETipoResiduo() {
        Agendamento ag = criarPendente("item.dono@teste.dev");
        TipoResiduo tipo = em.find(TipoResiduo.class, 1); // seed: Celular/Smartphone

        AgendamentoItem item = new AgendamentoItem();
        item.setAgendamento(ag);
        item.setTipoResiduo(tipo);
        item.setQuantidade(2);
        em.persist(item);
        em.flush();
        em.clear();

        AgendamentoItem lido = em.find(AgendamentoItem.class, item.getId());
        assertNotNull(lido, "agendamento_item deveria ter sido persistido");
        assertEquals(2, lido.getQuantidade());
        assertEquals(1, lido.getTipoResiduo().getId());
        assertEquals(ag.getId(), lido.getAgendamento().getId());
    }
}
