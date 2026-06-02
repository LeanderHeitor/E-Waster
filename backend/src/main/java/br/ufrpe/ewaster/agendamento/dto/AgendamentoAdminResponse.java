package br.ufrpe.ewaster.agendamento.dto;

import java.util.List;

/** Agendamento visto pelo admin: inclui o dono e os itens declarados. */
public record AgendamentoAdminResponse(
        Integer id,
        String status,
        int totalPts,
        String data,
        UsuarioMini usuario,
        List<ItemMini> itens
) {
    public record UsuarioMini(Integer id, String nome, String email, Integer pontuacaoTotal) {
    }

    public record ItemMini(String tipoResiduo, Integer quantidade, Integer pontuacaoBase) {
    }
}
