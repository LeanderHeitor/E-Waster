package br.ufrpe.ewaster.descarte;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DescarteRepository extends JpaRepository<Descarte, Integer> {

    // Descartes registrados no periodo [inicio, fim) — fim exclusivo para cobrir o dia inteiro.
    // Faz fetch do tipo de residuo e dos itens do agendamento para o relatorio calcular
    // quantidade/pontos sem depender do open-in-view.
    @Query("SELECT DISTINCT d FROM Descarte d " +
            "JOIN FETCH d.tipoResiduo " +
            "JOIN FETCH d.agendamento a " +
            "LEFT JOIN FETCH a.itens i " +
            "LEFT JOIN FETCH i.tipoResiduo " +
            "WHERE d.dataRegistro >= :inicio AND d.dataRegistro < :fim " +
            "ORDER BY d.dataRegistro")
    List<Descarte> findNoPeriodo(@Param("inicio") LocalDateTime inicio,
                                 @Param("fim") LocalDateTime fim);
}
