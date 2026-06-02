package br.ufrpe.ewaster.slot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SlotResponseDTO(
        Integer id,
        LocalDate data,
        LocalTime horarioInicio,
        LocalTime horarioFim,
        Integer capacidadeMaxima,
        long agendamentosAtivos,
        long vagasDisponiveis,
        boolean disponivel
) {
    public SlotResponseDTO(br.ufrpe.ewaster.slot.SlotColeta slot, long ativos) {
        this(
                slot.getId(),
                slot.getData(),
                slot.getHorarioInicio(),
                slot.getHorarioFim(),
                slot.getCapacidadeMaxima(),
                ativos,
                Math.max(0, slot.getCapacidadeMaxima() - ativos),
                (slot.getCapacidadeMaxima() - ativos) > 0 && slot.getAtivo()
        );
    }
}