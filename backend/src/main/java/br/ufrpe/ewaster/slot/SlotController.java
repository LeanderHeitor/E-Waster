package br.ufrpe.ewaster.slot;

import br.ufrpe.ewaster.slot.dto.SlotResponse;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
@CrossOrigin(origins = "http://localhost:5173")
public class SlotController {

    private final SlotService service;

    public SlotController(SlotService service) {
        this.service = service;
    }

    @GetMapping
    public List<SlotResponse> listar() {
        return service.listar();
    }
}
