package br.ufrpe.ewaster.agendamento;

import br.ufrpe.ewaster.agendamento.dto.AgendamentoRequest;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.slot.SlotColetaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final SlotColetaRepository slotColetaRepository;
    private final TipoResiduoRepository tipoResiduoRepository;
    private final UserRepository userRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              SlotColetaRepository slotColetaRepository,
                              TipoResiduoRepository tipoResiduoRepository,
                              UserRepository userRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.slotColetaRepository = slotColetaRepository;
        this.tipoResiduoRepository = tipoResiduoRepository;
        this.userRepository = userRepository;
    }

    // 🔴 TAREFA 2: POST /agendamentos (Adaptado para receber o e-mail do usuário logado)
    @Transactional
    public Agendamento criarAgendamento(AgendamentoRequest request, String emailUsuario) {
        // 1. Check de existência do Slot
        SlotColeta slot = slotColetaRepository.findById(request.slotId())
                .orElseThrow(() -> new RuntimeException("Slot não encontrado"));

        // 2. CHECK: COUNT < capacidade
        long atuais = agendamentoRepository.countAgendamentosAtivosPorSlot(request.slotId());
        if (atuais >= slot.getCapacidadeMaxima()) {
            throw new RuntimeException("Capacidade máxima do slot atingida!");
        }

        // ALTERADO: Busca pelo e-mail vindo do token de autenticação do Controller
        User usuario = userRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // 3. Criar o Pai (Agendamento)
        Agendamento agendamento = new Agendamento();
        agendamento.setUsuario(usuario);
        agendamento.setSlot(slot);
        agendamento.setStatus(StatusAgendamento.PENDENTE);

        // 4. Montar os Filhos (Itens)
        for (var itemReq : request.itens()) {
            TipoResiduo tipo = tipoResiduoRepository.findById(itemReq.tipoResiduoId())
                    .orElseThrow(() -> new RuntimeException("Tipo de resíduo não encontrado"));

            AgendamentoItem item = new AgendamentoItem();
            item.setTipoResiduo(tipo);
            item.setQuantidade(itemReq.quantidade());

            // Vincula filho ao pai
            item.setAgendamento(agendamento);
            agendamento.getItens().add(item);
        }

        // 5. INSERT pai+filhos (Cascade faz a mágica)
        return agendamentoRepository.save(agendamento);
    }

    // 🟢 TAREFA 7: DELETE /agendamentos/{id} (Cancelar agendamento checando se o e-mail bate com o dono)
    @Transactional
    public void cancelarAgendamento(Integer id, String emailUsuario) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        // Garante que o usuário logado só possa cancelar o próprio agendamento
        if (!agendamento.getUsuario().getEmail().equals(emailUsuario)) {
            throw new RuntimeException("Você não tem permissão para cancelar este agendamento.");
        }

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        agendamentoRepository.save(agendamento);
    }
}