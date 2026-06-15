package br.ufrpe.ewaster.slot;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.slot.dto.SlotResponseDTO;
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
import static org.junit.jupiter.api.Assertions.assertTrue;

// Cobre GET /slots (vaga derivada) testando o SlotColetaController do fluxo integrado.
@SpringBootTest
@Transactional // rollback automatico
class SlotColetaControllerTest {

    @Autowired SlotColetaController controller;
    @Autowired SlotColetaRepository slotRepository;
    @Autowired AgendamentoRepository agendamentoRepository;
    @Autowired UserRepository userRepository;

    private List<SlotResponseDTO> listar() {
        return controller.listarSlotsComVagas().getBody();
    }

    private SlotResponseDTO slot(List<SlotResponseDTO> lista, int id) {
        return lista.stream().filter(s -> s.id().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void listar_devolveSlotsComVagasDerivadasDentroDoLimite() {
        // Cria um slot conhecido (rollback automatico) em vez de cravar a contagem do
        // seed: a quantidade de slots cresce conforme o admin cadastra horarios, entao
        // assertar "exatamente 6" quebraria com o tempo. Aqui validamos a regra que
        // realmente importa: a derivacao de vagas.
        SlotColeta novo = new SlotColeta();
        novo.setData(LocalDate.now().plusYears(5));
        novo.setHorarioInicio(LocalTime.of(8, 0));
        novo.setHorarioFim(LocalTime.of(12, 0));
        novo.setCapacidadeMaxima(7);
        novo.setAtivo(true);
        Integer novoId = slotRepository.save(novo).getId();

        List<SlotResponseDTO> slots = listar();

        // O slot recem-criado aparece na listagem; sem agendamentos, todas as vagas livres.
        SlotResponseDTO criado = slot(slots, novoId);
        assertEquals(7, criado.capacidadeMaxima());
        assertEquals(7L, criado.vagasDisponiveis(), "slot novo sem agendamentos: vagas = capacidade");

        // Invariante geral: vagas derivadas sempre dentro de [0, capacidade] em qualquer slot.
        for (SlotResponseDTO s : slots) {
            assertTrue(s.vagasDisponiveis() >= 0 && s.vagasDisponiveis() <= s.capacidadeMaxima(),
                    "vagas fora do intervalo no slot " + s.id());
        }
    }

    @Test
    void vagas_caemComPendente_eVoltamAoCancelar() {
        int slotId = listar().get(0).id();
        long antes = slot(listar(), slotId).vagasDisponiveis();

        // simula um agendamento que ocupa a vaga
        SlotColeta slot = slotRepository.findById(slotId).orElseThrow();
        User dono = userRepository.save(new User("Dono Slot", "dono.slot@teste.dev", "x"));
        Agendamento ag = new Agendamento();
        ag.setUsuario(dono);
        ag.setSlot(slot);
        ag.setStatus(StatusAgendamento.PENDENTE);
        agendamentoRepository.save(ag);

        assertEquals(antes - 1, slot(listar(), slotId).vagasDisponiveis(),
                "1 PENDENTE deve ocupar exatamente 1 vaga");

        // cancelar libera a vaga (cancelado nao conta na derivacao)
        ag.setStatus(StatusAgendamento.CANCELADO);
        agendamentoRepository.save(ag);

        assertEquals(antes, slot(listar(), slotId).vagasDisponiveis(),
                "cancelado nao deve ocupar vaga");
    }
}
