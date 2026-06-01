package br.ufrpe.ewaster.slot;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.slot.dto.SlotResponse;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Cobre #4 (GET /slots), o seed de slots do #11 e a "vaga derivada" (Furo 2).
@SpringBootTest
@Transactional // rollback automatico: nao deixa lixo no banco dev
class SlotServiceTest {

    @Autowired SlotService slotService;
    @Autowired SlotRepository slotRepository;
    @Autowired AgendamentoRepository agendamentoRepository;
    @Autowired UserRepository userRepository;

    private SlotResponse slot(List<SlotResponse> slots, int id) {
        return slots.stream().filter(s -> s.getId().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void listar_devolveSeisSlotsComCamposFormatados() {
        List<SlotResponse> slots = slotService.listar();

        assertEquals(6, slots.size(), "seed (V3) deve ter 6 slots ativos");

        SlotResponse s1 = slot(slots, 1);
        assertEquals("02/06/2026", s1.getData());
        assertEquals("Terca", s1.getDia());
        assertEquals("Manha", s1.getTurno());
        assertEquals("08:00 - 12:00", s1.getHorario());
        assertEquals(5, s1.getMax());

        // invariante: 0 <= vagas <= capacidade, sempre
        for (SlotResponse s : slots) {
            assertTrue(s.getVagas() >= 0 && s.getVagas() <= s.getMax(),
                    "vagas fora do intervalo no slot " + s.getId());
        }
    }

    @Test
    void vagas_caemComPendente_eVoltamAoCancelar() {
        int antes = slot(slotService.listar(), 1).getVagas();

        // simula o que o POST /agendamentos (do colega) faria
        SlotColeta slot1 = slotRepository.findById(1).orElseThrow();
        User dono = userRepository.save(new User("Dono Slot", "dono.slot@teste.dev", "x"));
        Agendamento ag = new Agendamento();
        ag.setUsuario(dono);
        ag.setSlot(slot1);
        ag.setStatus(StatusAgendamento.PENDENTE);
        agendamentoRepository.save(ag);

        assertEquals(antes - 1, slot(slotService.listar(), 1).getVagas(),
                "1 PENDENTE deve ocupar exatamente 1 vaga");

        // cancelar deve liberar a vaga (cancelado nao conta na derivacao)
        ag.setStatus(StatusAgendamento.CANCELADO);
        agendamentoRepository.save(ag);

        assertEquals(antes, slot(slotService.listar(), 1).getVagas(),
                "cancelado nao deve ocupar vaga");
    }
}
