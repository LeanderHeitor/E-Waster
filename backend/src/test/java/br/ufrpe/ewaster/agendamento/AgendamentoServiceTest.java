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

import java.time.LocalDate;
import java.time.LocalTime;
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

    // Cria sempre um slot no futuro: não depende das datas fixas do seed (que vencem)
    // e satisfaz a nova trava de "horário já passou" no criarAgendamento.
    private Integer primeiroSlotId() {
        return novoSlot(LocalDate.now().plusDays(7));
    }

    private Integer slotPassadoId() {
        return novoSlot(LocalDate.now().minusDays(1));
    }

    private Integer novoSlot(LocalDate data) {
        SlotColeta s = new SlotColeta();
        s.setData(data);
        s.setHorarioInicio(LocalTime.of(8, 0));
        s.setHorarioFim(LocalTime.of(12, 0));
        s.setCapacidadeMaxima(5);
        s.setAtivo(true);
        return slotRepository.save(s).getId();
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
        Integer slotId = primeiroSlotId();
        SlotColeta slot = slotRepository.findById(slotId).orElseThrow();
        long ativos = agendamentoRepository.countAgendamentosAtivosPorSlot(slotId);
        long restantes = slot.getCapacidadeMaxima() - ativos;

        // preenche ate lotar (robusto a agendamentos pre-existentes no slot)
        for (long i = 0; i < restantes; i++) {
            String email = "lota" + i + "@teste.dev";
            novoUsuario(email);
            service.criarAgendamento(reqComUmItem(slotId), email);
        }

        // o proximo deve estourar
        novoUsuario("estouro@teste.dev");
        assertThrows(RuntimeException.class,
                () -> service.criarAgendamento(reqComUmItem(slotId), "estouro@teste.dev"));
    }

    @Test
    void criar_slotPassado_lancaErro() {
        novoUsuario("passado@teste.dev");
        assertThrows(RuntimeException.class,
                () -> service.criarAgendamento(reqComUmItem(slotPassadoId()), "passado@teste.dev"));
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

    // ===== Recusa pelo admin (PENDENTE -> NAO_COMPARECEU, sem pontuar) =====

    @Test
    void recusar_pendente_marcaNaoCompareceu() {
        novoUsuario("recusa1@teste.dev");
        Agendamento ag = service.criarAgendamento(reqComUmItem(primeiroSlotId()), "recusa1@teste.dev");

        service.recusarAgendamento(ag.getId());

        assertEquals(StatusAgendamento.NAO_COMPARECEU,
                agendamentoRepository.findById(ag.getId()).orElseThrow().getStatus());
    }

    @Test
    void recusar_naoSomaPontos() {
        novoUsuario("recusa2@teste.dev");
        Agendamento ag = service.criarAgendamento(reqComUmItem(primeiroSlotId()), "recusa2@teste.dev");

        service.recusarAgendamento(ag.getId());

        int pontos = userRepository.findByEmail("recusa2@teste.dev").orElseThrow().getPontuacaoTotal();
        assertEquals(0, pontos, "recusar não pode pontuar o usuário");
    }

    @Test
    void recusar_naoPendente_lancaErro_eNaoMuda() {
        novoUsuario("recusa3@teste.dev");
        Agendamento ag = service.criarAgendamento(reqComUmItem(primeiroSlotId()), "recusa3@teste.dev");
        service.cancelarAgendamento(ag.getId(), "recusa3@teste.dev"); // sai de PENDENTE

        assertThrows(RuntimeException.class, () -> service.recusarAgendamento(ag.getId()));
        assertEquals(StatusAgendamento.CANCELADO,
                agendamentoRepository.findById(ag.getId()).orElseThrow().getStatus());
    }

    @Test
    void recusar_inexistente_lancaErro() {
        assertThrows(RuntimeException.class, () -> service.recusarAgendamento(999999));
    }
}
