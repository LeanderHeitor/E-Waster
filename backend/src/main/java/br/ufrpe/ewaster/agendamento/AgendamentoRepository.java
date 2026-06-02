package br.ufrpe.ewaster.agendamento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    @Query("SELECT DISTINCT a FROM Agendamento a " +
            "JOIN FETCH a.slot " +
            "LEFT JOIN FETCH a.itens i " +
            "LEFT JOIN FETCH i.tipoResiduo " +
            "WHERE a.usuario.email = :email ORDER BY a.id DESC")
    List<Agendamento> findAllByUsuarioEmail(@Param("email") String email);

    // 🚀 ADICIONE ESTE MÉTODO PARA SANAR O ERRO DO SERVICE:
    @Query("SELECT COUNT(a) FROM Agendamento a WHERE a.slot.id = :slotId AND a.status <> 'CANCELADO'")
    long countAgendamentosAtivosPorSlot(@Param("slotId") Integer slotId);

    // Painel admin: todos os agendamentos PENDENTE com usuário, slot e itens carregados.
    @Query("SELECT DISTINCT a FROM Agendamento a " +
            "JOIN FETCH a.usuario " +
            "JOIN FETCH a.slot " +
            "LEFT JOIN FETCH a.itens i " +
            "LEFT JOIN FETCH i.tipoResiduo " +
            "WHERE a.status = br.ufrpe.ewaster.agendamento.StatusAgendamento.PENDENTE " +
            "ORDER BY a.id")
    List<Agendamento> findPendentesComUsuario();
}