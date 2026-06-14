package br.ufrpe.ewaster.campanha;

import jakarta.persistence.*;
import java.time.LocalDate;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;

@Entity
@Table(name = "campanha")
public class Campanha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(nullable = false)
private Double multiplicador = 1.0;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "tipo_residuo_id")
private TipoResiduo tipoResiduo;

    public Campanha() {
    }

    public Campanha(String nome, LocalDate dataInicio, LocalDate dataFim, Double multiplicador) {
    this.nome = nome;
    this.dataInicio = dataInicio;
    this.dataFim = dataFim;
    this.multiplicador = multiplicador != null ? multiplicador : 1.0;
}
    public Double getMultiplicador() {
    return multiplicador;
}

public void setMultiplicador(Double multiplicador) {
    this.multiplicador = multiplicador;
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
    public TipoResiduo getTipoResiduo() {
    return tipoResiduo;
}

public void setTipoResiduo(TipoResiduo tipoResiduo) {
    this.tipoResiduo = tipoResiduo;
}
}
