package br.ufrpe.ewaster.campanha.dto;

import br.ufrpe.ewaster.campanha.Campanha;

import java.time.LocalDate;

public class CampanhaResponse {

    private Integer id;
    private String nome;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private boolean ativa;

    public static CampanhaResponse from(Campanha campanha) {
        CampanhaResponse response = new CampanhaResponse();

        LocalDate hoje = LocalDate.now();

        response.id = campanha.getId();
        response.nome = campanha.getNome();
        response.dataInicio = campanha.getDataInicio();
        response.dataFim = campanha.getDataFim();
        response.ativa =
                !hoje.isBefore(campanha.getDataInicio()) &&
                !hoje.isAfter(campanha.getDataFim());

        return response;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public boolean isAtiva() {
        return ativa;
    }
}
