package br.ufrpe.ewaster.tiporesiduo;

import br.ufrpe.ewaster.tiporesiduo.dto.TipoResiduoResponse;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoResiduoService {

    private final TipoResiduoRepository repository;

    public TipoResiduoService(TipoResiduoRepository repository) {
        this.repository = repository;
    }

    public List<TipoResiduoResponse> listar() {

        return repository.findAll(Sort.by("id")).stream()
                .map(t -> new TipoResiduoResponse(
                        t.getId(),
                        t.getNome(),
                        t.getSigla(),
                        t.getPontuacaoBase()))
                .toList();
    }
}
