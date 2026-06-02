package br.ufrpe.ewaster.agendamento.dto;

public record AgendamentoItemRequest(
        Integer tipoResiduoId,
        Integer quantidade
) {}