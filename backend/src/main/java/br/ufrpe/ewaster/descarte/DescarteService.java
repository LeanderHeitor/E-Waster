package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DescarteService {

    private final AgendamentoRepository agendamentoRepository;
    private final DescarteRepository descarteRepository;
    private final UserRepository userRepository;

    public DescarteService(AgendamentoRepository agendamentoRepository,
                           DescarteRepository descarteRepository,
                           UserRepository userRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.descarteRepository = descarteRepository;
        this.userRepository = userRepository;
    }

    /**
     * Aprova um agendamento PENDENTE: cada item vira um descarte, os pontos
     * (pontuacao_base * quantidade) sao somados ao usuario e o agendamento
     * passa a REALIZADO. Devolve a nova pontuacao total do usuario.
     */
    @Transactional
    public int aprovarAgendamento(Integer agendamentoId) {
        Agendamento ag = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (ag.getStatus() != StatusAgendamento.PENDENTE) {
            throw new RuntimeException("Só agendamentos pendentes podem ser aprovados.");
        }

        User usuario = ag.getUsuario();
        int pontosGanhos = 0;

        for (AgendamentoItem item : ag.getItens()) {
            TipoResiduo tipo = item.getTipoResiduo();
            int qtd = item.getQuantidade() != null ? item.getQuantidade() : 1;
            pontosGanhos += tipo.getPontuacaoBase() * qtd;

            descarteRepository.save(new Descarte(usuario, tipo, ag));
        }

        int atual = usuario.getPontuacaoTotal() != null ? usuario.getPontuacaoTotal() : 0;
        usuario.setPontuacaoTotal(atual + pontosGanhos);
        userRepository.save(usuario);

        ag.setStatus(StatusAgendamento.REALIZADO);
        agendamentoRepository.save(ag);

        return usuario.getPontuacaoTotal();
    }
}
