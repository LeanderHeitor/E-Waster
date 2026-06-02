package br.ufrpe.ewaster.descarte.dto;

/** Corpo do POST /descartes: o admin aprova um agendamento pelo id. */
public record DescarteRequest(Integer agendamentoId) {
}
