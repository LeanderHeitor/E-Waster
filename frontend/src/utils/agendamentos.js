// Helpers puros de derivação dos agendamentos.
// Centraliza as regras que já causaram bug: só REALIZADO pontua; "ativo" = PENDENTE.

export const isRealizado = (a) => a?.status === "REALIZADO";
export const isPendente = (a) => a?.status === "PENDENTE";

// Pontos de um agendamento, tolerando os dois nomes de campo (backend novo x legado).
export const pontosDoAgendamento = (a) => a?.totalPontos ?? a?.totalPts ?? 0;

// Soma os pontos APENAS dos agendamentos REALIZADO (aprovados pelo admin).
// Pendente/cancelado/não-compareceu não entram — era o bug dos pontos acumulando.
export function totalPontosRealizados(agendamentos = []) {
  return agendamentos.filter(isRealizado).reduce((sum, a) => sum + pontosDoAgendamento(a), 0);
}

// Agendamentos "ativos" = aguardando validação do admin (PENDENTE).
export function agendamentosPendentes(agendamentos = []) {
  return agendamentos.filter(isPendente);
}
