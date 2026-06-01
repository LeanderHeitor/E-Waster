package br.ufrpe.ewaster.slot.dto;

public class SlotResponse {

    private final Integer id;
    private final String data;     // dd/MM/yyyy
    private final String dia;      // Segunda, Terca, ...
    private final String turno;    // Manha / Tarde
    private final String horario;  // HH:mm - HH:mm
    private final int vagas;       // capacidade - ocupadas (derivado)
    private final int max;         // capacidade_maxima

    public SlotResponse(Integer id, String data, String dia, String turno,
                        String horario, int vagas, int max) {
        this.id = id;
        this.data = data;
        this.dia = dia;
        this.turno = turno;
        this.horario = horario;
        this.vagas = vagas;
        this.max = max;
    }

    public Integer getId() {
        return id;
    }

    public String getData() {
        return data;
    }

    public String getDia() {
        return dia;
    }

    public String getTurno() {
        return turno;
    }

    public String getHorario() {
        return horario;
    }

    public int getVagas() {
        return vagas;
    }

    public int getMax() {
        return max;
    }
}
