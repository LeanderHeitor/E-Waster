package br.ufrpe.ewaster.agendamento;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {

    public enum ResultadoCancelamento { OK, NAO_ENCONTRADO, NAO_DONO }

    private final AgendamentoRepository repository;

    public AgendamentoService(AgendamentoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ResultadoCancelamento cancelar(Integer id, String emailDono) {

        Agendamento agendamento = repository.findById(id).orElse(null);

        if (agendamento == null) {
            return ResultadoCancelamento.NAO_ENCONTRADO;
        }

        // Dono: o e-mail do JWT precisa bater com o do usuario do agendamento.
        if (!agendamento.getUsuario().getEmail().equals(emailDono)) {
            return ResultadoCancelamento.NAO_DONO;
        }

        // Idempotente: cancelar algo ja cancelado nao e erro.
        if (agendamento.getStatus() != StatusAgendamento.CANCELADO) {
            agendamento.setStatus(StatusAgendamento.CANCELADO);
            repository.save(agendamento);
        }

        return ResultadoCancelamento.OK;
    }
}
