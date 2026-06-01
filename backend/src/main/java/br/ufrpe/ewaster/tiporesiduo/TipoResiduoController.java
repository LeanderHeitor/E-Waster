package br.ufrpe.ewaster.tiporesiduo;

import br.ufrpe.ewaster.tiporesiduo.dto.TipoResiduoResponse;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tipos-residuo")
@CrossOrigin(origins = "http://localhost:5173")
public class TipoResiduoController {

    private final TipoResiduoService service;

    public TipoResiduoController(TipoResiduoService service) {
        this.service = service;
    }

    @GetMapping
    public List<TipoResiduoResponse> listar() {
        return service.listar();
    }
}
