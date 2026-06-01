package br.ufrpe.ewaster.agendamento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    // Quantos agendamentos ocupam vaga em cada slot, agrupado por slot.
    // Retorna linhas [slotId, total]. Cancelados (e nao-comparecimentos) nao contam.
    @Query("""
            SELECT a.slot.id, COUNT(a)
            FROM Agendamento a
            WHERE a.status IN :statuses
            GROUP BY a.slot.id
            """)
    List<Object[]> contarOcupacaoPorSlot(@Param("statuses") List<StatusAgendamento> statuses);
}
