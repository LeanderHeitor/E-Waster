package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.campanha.Campanha;
import br.ufrpe.ewaster.campanha.CampanhaRepository;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DescarteService {

    private final AgendamentoRepository agendamentoRepository;
    private final DescarteRepository descarteRepository;
    private final UserRepository userRepository;
    private final CampanhaRepository campanhaRepository;

    public DescarteService(AgendamentoRepository agendamentoRepository,
                           DescarteRepository descarteRepository,
                           UserRepository userRepository,
                           CampanhaRepository campanhaRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.descarteRepository = descarteRepository;
        this.userRepository = userRepository;
        this.campanhaRepository = campanhaRepository;
    }

    /**
     * Aprova um agendamento PENDENTE: cada item vira um descarte, os pontos
     * (pontuacao_base * quantidade * multiplicador de campanha) sao somados ao
     * usuario e o agendamento passa a REALIZADO. O multiplicador vem da melhor
     * campanha ativa na DATA DO SLOT (quando o descarte acontece). Devolve a
     * nova pontuacao total do usuario.
     */
    @Transactional
    public int aprovarAgendamento(Integer agendamentoId) {
        Agendamento ag = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (ag.getStatus() != StatusAgendamento.PENDENTE) {
            throw new RuntimeException("Só agendamentos pendentes podem ser aprovados.");
        }

        User usuario = ag.getUsuario();

        // Campanhas vigentes na data do slot — usadas para bonificar os pontos.
        LocalDate dataDescarte = ag.getSlot().getData();
        List<Campanha> campanhasVigentes = campanhaRepository
                .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(dataDescarte, dataDescarte);

        int pontosGanhos = 0;

        for (AgendamentoItem item : ag.getItens()) {
            TipoResiduo tipo = item.getTipoResiduo();
            int qtd = item.getQuantidade() != null ? item.getQuantidade() : 1;
            double multiplicador = melhorMultiplicador(campanhasVigentes, tipo);
            pontosGanhos += (int) Math.round(tipo.getPontuacaoBase() * qtd * multiplicador);

            descarteRepository.save(new Descarte(usuario, tipo, ag));
        }

        int atual = usuario.getPontuacaoTotal() != null ? usuario.getPontuacaoTotal() : 0;
        usuario.setPontuacaoTotal(atual + pontosGanhos);
        userRepository.save(usuario);

        // Congela os pontos concedidos (já com multiplicador) para todas as telas
        // exibirem o mesmo valor final e para conseguirmos estorná-los num cancelamento.
        ag.setTotalPontos(pontosGanhos);
        ag.setStatus(StatusAgendamento.REALIZADO);
        agendamentoRepository.save(ag);

        return usuario.getPontuacaoTotal();
    }

    /**
     * Maior multiplicador entre as campanhas que se aplicam ao tipo: uma campanha
     * sem tipo de resíduo vale para todos; com tipo definido, só para aquele.
     * Sem campanha aplicável, retorna 1.0 (sem bônus).
     */
    private double melhorMultiplicador(List<Campanha> campanhas, TipoResiduo tipo) {
        return campanhas.stream()
                .filter(c -> c.getTipoResiduo() == null
                        || c.getTipoResiduo().getId().equals(tipo.getId()))
                .mapToDouble(c -> c.getMultiplicador() != null ? c.getMultiplicador() : 1.0)
                .max()
                .orElse(1.0);
    }
}
