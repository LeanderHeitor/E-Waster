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
import br.ufrpe.ewaster.campanha.Campanha;
import br.ufrpe.ewaster.campanha.CampanhaRepository;
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
        LocalDate hoje = LocalDate.now();

List<Campanha> campanhasAtivas = campanhaRepository
        .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(hoje, hoje);

        for (AgendamentoItem item : ag.getItens()) {
            TipoResiduo tipo = item.getTipoResiduo();
            int qtd = item.getQuantidade() != null ? item.getQuantidade() : 1;
            int pontosBase = tipo.getPontuacaoBase() * qtd;
double multiplicador = obterMaiorMultiplicadorAplicavel(tipo, campanhasAtivas);
int pontosComCampanha = (int) Math.round(pontosBase * multiplicador);

pontosGanhos += pontosComCampanha;

            descarteRepository.save(new Descarte(usuario, tipo, ag));
        }

        int atual = usuario.getPontuacaoTotal() != null ? usuario.getPontuacaoTotal() : 0;
        usuario.setPontuacaoTotal(atual + pontosGanhos);
        userRepository.save(usuario);

        ag.setStatus(StatusAgendamento.REALIZADO);
        agendamentoRepository.save(ag);

        return usuario.getPontuacaoTotal();
    }
    private double obterMaiorMultiplicadorAplicavel(TipoResiduo tipo, List<Campanha> campanhasAtivas) {
    double maiorMultiplicador = 1.0;

    for (Campanha campanha : campanhasAtivas) {
        Double multiplicador = campanha.getMultiplicador() != null
                ? campanha.getMultiplicador()
                : 1.0;

        boolean campanhaGlobal = campanha.getTipoResiduo() == null;

        boolean campanhaDoTipo =
                campanha.getTipoResiduo() != null &&
                campanha.getTipoResiduo().getId().equals(tipo.getId());

        if ((campanhaGlobal || campanhaDoTipo) && multiplicador > maiorMultiplicador) {
            maiorMultiplicador = multiplicador;
        }
    }

    return maiorMultiplicador;
}
}
