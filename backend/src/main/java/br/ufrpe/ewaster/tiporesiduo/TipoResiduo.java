package br.ufrpe.ewaster.tiporesiduo;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_residuo")
public class TipoResiduo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "pontuacao_base", nullable = false)
    private Integer pontuacaoBase;

    @Column(length = 10)
    private String sigla;

    public TipoResiduo() {
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getPontuacaoBase() {
        return pontuacaoBase;
    }

    public void setPontuacaoBase(Integer pontuacaoBase) {
        this.pontuacaoBase = pontuacaoBase;
    }

    public String getSigla() {
        return sigla;
    }

    public void setSigla(String sigla) {
        this.sigla = sigla;
    }
}
