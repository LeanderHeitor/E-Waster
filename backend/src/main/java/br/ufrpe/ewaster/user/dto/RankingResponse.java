package br.ufrpe.ewaster.user.dto;

import br.ufrpe.ewaster.user.User;

/** Linha do ranking público: só nome e pontuação (nunca expõe email/senha). */
public record RankingResponse(
        Integer id,
        String nome,
        Integer pontuacaoTotal
) {
    public static RankingResponse from(User u) {
        return new RankingResponse(
                u.getId(),
                u.getNome(),
                u.getPontuacaoTotal() != null ? u.getPontuacaoTotal() : 0
        );
    }
}
