package br.ufrpe.ewaster.slot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SlotColetaRepository extends JpaRepository<SlotColeta, Integer> {

    // Busca apenas os slots ativos no sistema e ordena cronologicamente
    List<SlotColeta> findAllByAtivoTrueOrderByDataAscHorarioInicioAsc();

    // Slots ativos de uma data específica — usado para detectar conflito de horário.
    List<SlotColeta> findAllByAtivoTrueAndData(LocalDate data);
}