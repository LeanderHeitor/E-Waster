package br.ufrpe.ewaster.slot;

import br.ufrpe.ewaster.agendamento.AgendamentoRepository;
import br.ufrpe.ewaster.slot.dto.SlotCreateRequest;
import br.ufrpe.ewaster.slot.dto.SlotResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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

    // Cria um novo horario de coleta (somente ADMIN — ver SecurityConfig).
    // Resolve o gargalo do seed V2: era a unica fonte de slots e tinha datas fixas que vencem.
    @PostMapping
    public ResponseEntity<?> criarSlot(@RequestBody SlotCreateRequest request) {
        // Validacao basica de entrada
        if (request.data() == null || request.horarioInicio() == null
                || request.horarioFim() == null || request.capacidadeMaxima() == null) {
            return ResponseEntity.badRequest()
                    .body("Informe data, horário de início, horário de fim e capacidade.");
        }
        if (!request.horarioFim().isAfter(request.horarioInicio())) {
            return ResponseEntity.badRequest()
                    .body("O horário de fim deve ser maior que o de início.");
        }
        if (request.capacidadeMaxima() < 1) {
            return ResponseEntity.badRequest()
                    .body("A capacidade máxima deve ser de pelo menos 1.");
        }
        if (request.data().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest()
                    .body("Não é possível criar um horário em uma data passada.");
        }

        // Verificacao de conflito: nenhum outro slot ativo na mesma data pode ter
        // faixa de horario sobreposta (inicio < fimExistente && fim > inicioExistente).
        boolean conflito = slotRepository.findAllByAtivoTrueAndData(request.data()).stream()
                .anyMatch(existente ->
                        request.horarioInicio().isBefore(existente.getHorarioFim())
                                && request.horarioFim().isAfter(existente.getHorarioInicio()));
        if (conflito) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Já existe um horário ativo que se sobrepõe a esse intervalo nessa data.");
        }

        SlotColeta slot = new SlotColeta();
        slot.setData(request.data());
        slot.setHorarioInicio(request.horarioInicio());
        slot.setHorarioFim(request.horarioFim());
        slot.setCapacidadeMaxima(request.capacidadeMaxima());
        slot.setAtivo(true);

        SlotColeta salvo = slotRepository.save(slot);

        // Slot recem-criado ainda nao tem agendamentos (0 ativos).
        return ResponseEntity.status(HttpStatus.CREATED).body(new SlotResponseDTO(salvo, 0));
    }
}