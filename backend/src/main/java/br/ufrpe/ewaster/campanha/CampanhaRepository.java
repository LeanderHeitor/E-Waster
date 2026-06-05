package br.ufrpe.ewaster.campanha;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CampanhaRepository extends JpaRepository<Campanha, Integer> {

    List<Campanha> findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(
            LocalDate dataInicio,
            LocalDate dataFim
    );
}