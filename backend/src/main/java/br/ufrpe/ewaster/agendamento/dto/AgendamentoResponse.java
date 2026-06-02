package br.ufrpe.ewaster.agendamento.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AgendamentoResponse(
        Integer id,
        String status,
        int totalPontos,
        SlotDTO slot,
        List<ItemResponse> itens
) {
    public record SlotDTO(
            Integer id,
            LocalDate data,
            LocalTime horarioInicio,
            LocalTime horarioFim
    ) {}

    public record ItemResponse(
            Integer id,
            String nomeResiduo,
            int quantidade,
            int pontos
    ) {}
}