package br.ufrpe.ewaster.slot;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<SlotColeta, Integer> {

    List<SlotColeta> findByAtivoTrueOrderByDataAscHorarioInicioAsc();
}
