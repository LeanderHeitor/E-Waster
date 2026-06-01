package br.ufrpe.ewaster.tiporesiduo;

import br.ufrpe.ewaster.tiporesiduo.dto.TipoResiduoResponse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Cobre #10 (GET /tipos-residuo) e o seed de tipos do #11 (V3).
@SpringBootTest
class TipoResiduoServiceTest {

    @Autowired
    TipoResiduoService service;

    @Test
    void listar_devolveOsNoveTiposDoSeedOrdenadosPorId() {
        List<TipoResiduoResponse> tipos = service.listar();

        assertEquals(9, tipos.size(), "seed (V3) deve ter 9 tipos de residuo");

        // ordenado por id e com os campos mapeados (sigla + pontuacaoBase)
        TipoResiduoResponse primeiro = tipos.get(0);
        assertEquals(1, primeiro.getId());
        assertEquals("Celular/Smartphone", primeiro.getNome());
        assertEquals("CEL", primeiro.getSigla());
        assertEquals(15, primeiro.getPontuacaoBase());
    }

    @Test
    void listar_todosTemSiglaEPontuacao() {
        for (TipoResiduoResponse t : service.listar()) {
            assertFalse(t.getSigla() == null || t.getSigla().isBlank(),
                    "tipo " + t.getNome() + " deveria ter sigla");
            assertTrue(t.getPontuacaoBase() != null && t.getPontuacaoBase() > 0,
                    "tipo " + t.getNome() + " deveria ter pontuacao > 0");
        }
    }
}
