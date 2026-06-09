package br.ufrpe.ewaster.campanha.dto;

import java.time.LocalDate;

public class CampanhaRequest {

    private String nome;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Double multiplicador;
    private Integer tipoResiduoId;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }
    public Double getMultiplicador() {
    return multiplicador;
}

public void setMultiplicador(Double multiplicador) {
    this.multiplicador = multiplicador;
}
public Integer getTipoResiduoId() {
    return tipoResiduoId;
}

public void setTipoResiduoId(Integer tipoResiduoId) {
    this.tipoResiduoId = tipoResiduoId;
}
}
