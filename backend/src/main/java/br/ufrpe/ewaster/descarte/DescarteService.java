package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.agendamento.AgendamentoItem;
import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.campanha.Campanha;
import br.ufrpe.ewaster.campanha.CampanhaRepository;
import br.ufrpe.ewaster.exception.RegraNegocioException;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
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
                .orElseThrow(() -> new RegraNegocioException("Agendamento não encontrado", HttpStatus.NOT_FOUND));

        if (ag.getStatus() != StatusAgendamento.PENDENTE) {
            throw new RegraNegocioException("Só agendamentos pendentes podem ser aprovados.");
        }

        User usuario = ag.getUsuario();

        // Campanhas vigentes na data do slot — usadas para bonificar os pontos.
        LocalDate dataDescarte = ag.getSlot().getData();
        List<Campanha> campanhasVigentes = campanhaRepository
                .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(dataDescarte, dataDescarte);

        int pontosGanhos = 0;
        Campanha melhorCampanhaAplicada = null; // a de maior multiplicador entre os itens

        for (AgendamentoItem item : ag.getItens()) {
            TipoResiduo tipo = item.getTipoResiduo();
            int qtd = item.getQuantidade() != null ? item.getQuantidade() : 1;

            Campanha campanhaItem = melhorCampanha(campanhasVigentes, tipo);
            double multiplicador = multiplicadorDe(campanhaItem);
            pontosGanhos += (int) Math.round(tipo.getPontuacaoBase() * qtd * multiplicador);

            if (multiplicadorDe(melhorCampanhaAplicada) < multiplicador) {
                melhorCampanhaAplicada = campanhaItem;
            }

            descarteRepository.save(new Descarte(usuario, tipo, ag));
        }

        int atual = usuario.getPontuacaoTotal() != null ? usuario.getPontuacaoTotal() : 0;
        usuario.setPontuacaoTotal(atual + pontosGanhos);
        userRepository.save(usuario);

        // Congela os pontos concedidos (já com multiplicador) para todas as telas
        // exibirem o mesmo valor final e para conseguirmos estorná-los num cancelamento.
        ag.setTotalPontos(pontosGanhos);
        // Congela também a campanha/multiplicador aplicados, para "Meus Agendamentos"
        // mostrar a origem do bônus mesmo que a campanha mude/expire depois.
        double multiplicadorFinal = multiplicadorDe(melhorCampanhaAplicada);
        if (melhorCampanhaAplicada != null && multiplicadorFinal > 1.0) {
            ag.setMultiplicador(multiplicadorFinal);
            ag.setCampanhaNome(melhorCampanhaAplicada.getNome());
        } else {
            ag.setMultiplicador(1.0);
            ag.setCampanhaNome(null);
        }
        ag.setStatus(StatusAgendamento.REALIZADO);
        agendamentoRepository.save(ag);

        return usuario.getPontuacaoTotal();
    }

    /**
     * Melhor campanha (maior multiplicador) entre as que se aplicam ao tipo: uma
     * campanha sem tipo de resíduo vale para todos; com tipo definido, só para
     * aquele. Sem campanha aplicável, retorna null (sem bônus).
     */
    private Campanha melhorCampanha(List<Campanha> campanhas, TipoResiduo tipo) {
        return campanhas.stream()
                .filter(c -> c.getTipoResiduo() == null
                        || c.getTipoResiduo().getId().equals(tipo.getId()))
                .max(Comparator.comparingDouble(this::multiplicadorDe))
                .orElse(null);
    }

    // Multiplicador de uma campanha (1.0 se nula ou sem valor definido).
    private double multiplicadorDe(Campanha campanha) {
        if (campanha == null || campanha.getMultiplicador() == null) {
            return 1.0;
        }
        return campanha.getMultiplicador();
    }
}
