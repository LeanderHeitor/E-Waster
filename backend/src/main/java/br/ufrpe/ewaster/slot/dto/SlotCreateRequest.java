package br.ufrpe.ewaster.slot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

// Payload que o admin envia para criar um novo horario de coleta.
public record SlotCreateRequest(
        LocalDate data,
        LocalTime horarioInicio,
        LocalTime horarioFim,
        Integer capacidadeMaxima
) {
}
