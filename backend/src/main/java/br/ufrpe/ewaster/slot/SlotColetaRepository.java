package br.ufrpe.ewaster.slot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SlotColetaRepository extends JpaRepository<SlotColeta, Integer> {

    // Busca apenas os slots ativos no sistema e ordena cronologicamente
    List<SlotColeta> findAllByAtivoTrueOrderByDataAscHorarioInicioAsc();
}