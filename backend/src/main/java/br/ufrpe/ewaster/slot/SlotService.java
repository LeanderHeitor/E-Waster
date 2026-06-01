package br.ufrpe.ewaster.slot;

import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.agendamento.StatusAgendamento;
import br.ufrpe.ewaster.slot.dto.SlotResponse;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SlotService {

    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // Status que "seguram" uma vaga. Cancelado e nao-comparecimento liberam.
    private static final List<StatusAgendamento> OCUPAM_VAGA =
            List.of(StatusAgendamento.PENDENTE, StatusAgendamento.REALIZADO);

    private final SlotRepository slotRepository;
    private final AgendamentoRepository agendamentoRepository;

    public SlotService(SlotRepository slotRepository, AgendamentoRepository agendamentoRepository) {
        this.slotRepository = slotRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    public List<SlotResponse> listar() {

        Map<Integer, Long> ocupacao = new HashMap<>();
        for (Object[] linha : agendamentoRepository.contarOcupacaoPorSlot(OCUPAM_VAGA)) {
            ocupacao.put((Integer) linha[0], (Long) linha[1]);
        }

        List<SlotResponse> resposta = new ArrayList<>();
        for (SlotColeta slot : slotRepository.findByAtivoTrueOrderByDataAscHorarioInicioAsc()) {

            int ocupadas = ocupacao.getOrDefault(slot.getId(), 0L).intValue();
            int vagas = Math.max(0, slot.getCapacidadeMaxima() - ocupadas);

            resposta.add(new SlotResponse(
                    slot.getId(),
                    slot.getData().format(DATA_FMT),
                    diaDaSemana(slot.getData().getDayOfWeek()),
                    turno(slot.getHorarioInicio()),
                    slot.getHorarioInicio().format(HORA_FMT) + " - " + slot.getHorarioFim().format(HORA_FMT),
                    vagas,
                    slot.getCapacidadeMaxima()));
        }
        return resposta;
    }

    private String turno(LocalTime inicio) {
        return inicio.getHour() < 12 ? "Manha" : "Tarde";
    }

    private String diaDaSemana(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> "Segunda";
            case TUESDAY -> "Terca";
            case WEDNESDAY -> "Quarta";
            case THURSDAY -> "Quinta";
            case FRIDAY -> "Sexta";
            case SATURDAY -> "Sabado";
            case SUNDAY -> "Domingo";
        };
    }
}
