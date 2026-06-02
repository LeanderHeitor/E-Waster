package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoService;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoItemRequest;
import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
import br.ufrpe.ewaster.auth.service.JwtService;
import br.ufrpe.ewaster.slot.SlotColetaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;
import br.ufrpe.ewaster.user.TipoUsuario;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Cobre a AUTORIZAÇÃO das rotas admin: só ADMIN pode registrar descarte / listar usuários.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional // rollback automatico
class DescarteControllerTest {

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
        Integer slotId = slotRepository.findAllByAtivoTrueOrderByDataAscHorarioInicioAsc().get(0).getId();
        Integer tipoId = tipoResiduoRepository.findAll().get(0).getId();
        Agendamento ag = agendamentoService.criarAgendamento(
                new AgendamentoRequest(slotId, List.of(new AgendamentoItemRequest(tipoId, 1))), email);
        return ag.getId();
    }

    @Test
    void postDescartes_semToken_negado() throws Exception {
        mvc.perform(post("/api/v1/descartes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"agendamentoId\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void postDescartes_usuarioComum_negado() throws Exception {
        String token = tokenDe("comum@teste.dev", TipoUsuario.USUARIO);

        mvc.perform(post("/api/v1/descartes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"agendamentoId\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void postDescartes_admin_criado() throws Exception {
        String adminToken = tokenDe("admin.ctrl@teste.dev", TipoUsuario.ADMIN);
        userRepository.save(new User("Dono", "dono.ctrl@teste.dev", "x"));
        Integer agId = agendamentoPendenteDe("dono.ctrl@teste.dev");

        mvc.perform(post("/api/v1/descartes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"agendamentoId\":" + agId + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    void getUsuarios_usuarioComum_negado() throws Exception {
        String token = tokenDe("comum2@teste.dev", TipoUsuario.USUARIO);

        mvc.perform(get("/api/v1/usuarios")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUsuarios_admin_ok() throws Exception {
        String adminToken = tokenDe("admin2.ctrl@teste.dev", TipoUsuario.ADMIN);

        mvc.perform(get("/api/v1/usuarios")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
