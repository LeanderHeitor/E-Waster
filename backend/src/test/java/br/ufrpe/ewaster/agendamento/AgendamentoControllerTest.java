package br.ufrpe.ewaster.agendamento;

import br.ufrpe.ewaster.agendamento.dto.AgendamentoItemRequest;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
import br.ufrpe.ewaster.auth.service.JwtService;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.slot.SlotColetaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;
import br.ufrpe.ewaster.user.TipoUsuario;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Cobre a AUTORIZAÇÃO das rotas admin de agendamento: só ADMIN recusa / lista pendentes.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional // rollback automatico
class AgendamentoControllerTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwtService;
    @Autowired UserRepository userRepository;
    @Autowired AgendamentoService agendamentoService;
    @Autowired SlotColetaRepository slotRepository;
    @Autowired TipoResiduoRepository tipoResiduoRepository;

    private String tokenDe(String email, TipoUsuario tipo) {
        User u = new User("Teste " + tipo, email, "x");
        u.setTipo(tipo);
        userRepository.save(u);
        return jwtService.generateToken(email);
    }

    private Integer agendamentoPendenteDe(String email) {
        Integer tipoId = tipoResiduoRepository.findAll().get(0).getId();
        Agendamento ag = agendamentoService.criarAgendamento(
                new AgendamentoRequest(slotFuturoId(), List.of(new AgendamentoItemRequest(tipoId, 1))), email);
        return ag.getId();
    }

    // Slot sempre futuro: não depende do seed (que vence) e passa na trava de "horário já passou".
    private Integer slotFuturoId() {
        SlotColeta s = new SlotColeta();
        s.setData(LocalDate.now().plusDays(7));
        s.setHorarioInicio(LocalTime.of(8, 0));
        s.setHorarioFim(LocalTime.of(12, 0));
        s.setCapacidadeMaxima(5);
        s.setAtivo(true);
        return slotRepository.save(s).getId();
    }

    @Test
    void recusar_semToken_negado() throws Exception {
        mvc.perform(patch("/api/v1/agendamentos/1/recusar"))
                .andExpect(status().isForbidden());
    }

    @Test
    void recusar_usuarioComum_negado() throws Exception {
        String token = tokenDe("comum.recusa@teste.dev", TipoUsuario.USUARIO);

        mvc.perform(patch("/api/v1/agendamentos/1/recusar")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void recusar_admin_ok() throws Exception {
        String adminToken = tokenDe("admin.recusa@teste.dev", TipoUsuario.ADMIN);
        userRepository.save(new User("Dono", "dono.recusa@teste.dev", "x"));
        Integer agId = agendamentoPendenteDe("dono.recusa@teste.dev");

        mvc.perform(patch("/api/v1/agendamentos/" + agId + "/recusar")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void pendentes_usuarioComum_negado() throws Exception {
        String token = tokenDe("comum.pend@teste.dev", TipoUsuario.USUARIO);

        mvc.perform(get("/api/v1/agendamentos/pendentes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void pendentes_admin_ok() throws Exception {
        String adminToken = tokenDe("admin.pend@teste.dev", TipoUsuario.ADMIN);

        mvc.perform(get("/api/v1/agendamentos/pendentes")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
