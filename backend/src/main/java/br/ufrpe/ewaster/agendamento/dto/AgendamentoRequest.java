package br.ufrpe.ewaster.agendamento.dto;
import java.util.List;

public record AgendamentoRequest(
        Integer slotId,
        List<AgendamentoItemRequest> itens
) {}