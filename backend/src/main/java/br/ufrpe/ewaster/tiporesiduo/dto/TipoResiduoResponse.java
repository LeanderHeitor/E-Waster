package br.ufrpe.ewaster.tiporesiduo.dto;

public class TipoResiduoResponse {

    private final Integer id;
    private final String nome;
    private final String sigla;
    private final Integer pontuacaoBase;

    public TipoResiduoResponse(Integer id, String nome, String sigla, Integer pontuacaoBase) {
        this.id = id;
        this.nome = nome;
        this.sigla = sigla;
        this.pontuacaoBase = pontuacaoBase;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getSigla() {
        return sigla;
    }

    public Integer getPontuacaoBase() {
        return pontuacaoBase;
    }
}
