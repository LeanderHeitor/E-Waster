package br.ufrpe.ewaster.campanha;

import br.ufrpe.ewaster.campanha.dto.CampanhaRequest;
import br.ufrpe.ewaster.campanha.dto.CampanhaResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduoRepository;

@RestController
@RequestMapping("/api/v1/campanhas")
@CrossOrigin(origins = "http://localhost:5173")
public class CampanhaController {

    @Autowired
    private CampanhaRepository campanhaRepository;

    @Autowired
private TipoResiduoRepository tipoResiduoRepository;

    @GetMapping
    public ResponseEntity<List<CampanhaResponse>> listarCampanhas() {
        List<CampanhaResponse> campanhas = campanhaRepository.findAll()
                .stream()
                .map(CampanhaResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(campanhas);
    }

    @GetMapping("/ativas")
    public ResponseEntity<List<CampanhaResponse>> listarCampanhasAtivas() {
        LocalDate hoje = LocalDate.now();

        List<CampanhaResponse> campanhas = campanhaRepository
                .findByDataInicioLessThanEqualAndDataFimGreaterThanEqual(hoje, hoje)
                .stream()
                .map(CampanhaResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(campanhas);
    }

    @PostMapping
    public ResponseEntity<CampanhaResponse> criarCampanha(@RequestBody CampanhaRequest request) {
        validarRequest(request);

        Campanha campanha = new Campanha(
        request.getNome().trim(),
        request.getDataInicio(),
        request.getDataFim(),
        request.getMultiplicador()
);
if (request.getTipoResiduoId() != null) {
    TipoResiduo tipoResiduo = tipoResiduoRepository.findById(request.getTipoResiduoId())
            .orElseThrow(() -> new RuntimeException("Tipo de resíduo não encontrado."));
    campanha.setTipoResiduo(tipoResiduo);
}

        Campanha salva = campanhaRepository.save(campanha);

        return ResponseEntity.ok(CampanhaResponse.from(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampanhaResponse> atualizarCampanha(
            @PathVariable Integer id,
            @RequestBody CampanhaRequest request
    ) {
        validarRequest(request);

        Campanha campanha = campanhaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campanha não encontrada."));

        campanha.setNome(request.getNome().trim());
        campanha.setDataInicio(request.getDataInicio());
        campanha.setDataFim(request.getDataFim());
        campanha.setMultiplicador(request.getMultiplicador() != null ? request.getMultiplicador() : 1.0);
        if (request.getTipoResiduoId() != null) {
    TipoResiduo tipoResiduo = tipoResiduoRepository.findById(request.getTipoResiduoId())
            .orElseThrow(() -> new RuntimeException("Tipo de resíduo não encontrado."));
    campanha.setTipoResiduo(tipoResiduo);
} else {
    campanha.setTipoResiduo(null);
}

        Campanha atualizada = campanhaRepository.save(campanha);

        return ResponseEntity.ok(CampanhaResponse.from(atualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCampanha(@PathVariable Integer id) {
        if (!campanhaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        campanhaRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    private void validarRequest(CampanhaRequest request) {
        if (request.getNome() == null || request.getNome().trim().isEmpty()) {
            throw new RuntimeException("O nome da campanha é obrigatório.");
        }

        if (request.getDataInicio() == null) {
            throw new RuntimeException("A data de início é obrigatória.");
        }

        if (request.getDataFim() == null) {
            throw new RuntimeException("A data de fim é obrigatória.");
        }

        if (request.getDataFim().isBefore(request.getDataInicio())) {
            throw new RuntimeException("A data de fim não pode ser anterior à data de início.");
        }
        if (request.getMultiplicador() != null && request.getMultiplicador() < 1.0) {
    throw new RuntimeException("O multiplicador deve ser maior ou igual a 1.");
}
    }
}