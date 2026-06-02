package br.ufrpe.ewaster.slot;

import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.slot.dto.SlotResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/slots")
public class SlotColetaController {

    private final SlotColetaRepository slotRepository;
    private final AgendamentoRepository agendamentoRepository;

    public SlotColetaController(SlotColetaRepository slotRepository, AgendamentoRepository agendamentoRepository) {
        this.slotRepository = slotRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    @GetMapping
    public ResponseEntity<List<SlotResponseDTO>> listarSlotsComVagas() {
        // 1. Busca todos os slots marcados como ativos
        List<SlotColeta> slots = slotRepository.findAllByAtivoTrueOrderByDataAscHorarioInicioAsc();

        // 2. Calcula as vagas derivadas cruzando com o count de agendamentos ativos
        List<SlotResponseDTO> resposta = slots.stream().map(slot -> {
            long ativos = agendamentoRepository.countAgendamentosAtivosPorSlot(slot.getId());
            return new SlotResponseDTO(slot, ativos);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resposta);
    }
}