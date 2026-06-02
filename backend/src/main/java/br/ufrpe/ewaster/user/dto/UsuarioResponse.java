package br.ufrpe.ewaster.user.dto;

import br.ufrpe.ewaster.user.User;

/** Projeção segura do usuário (sem o hash da senha) para telas administrativas. */
public record UsuarioResponse(
        Integer id,
        String nome,
        String email,
        String tipo,
        Integer pontuacaoTotal
) {
    public static UsuarioResponse from(User u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getTipo() != null ? u.getTipo().name() : null,
                u.getPontuacaoTotal() != null ? u.getPontuacaoTotal() : 0
        );
    }
}
