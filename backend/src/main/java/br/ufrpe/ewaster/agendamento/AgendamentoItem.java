package br.ufrpe.ewaster.agendamento;

import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import jakarta.persistence.*;

@Entity
@Table(name = "agendamento_item")
public class AgendamentoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_residuo_id")
    private TipoResiduo tipoResiduo;

    @Column(nullable = false)
    private Integer quantidade = 1;

    public AgendamentoItem() {
    }

    public Integer getId() {
        return id;
    }

    public Agendamento getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(Agendamento agendamento) {
        this.agendamento = agendamento;
    }

    public TipoResiduo getTipoResiduo() {
        return tipoResiduo;
    }

    public void setTipoResiduo(TipoResiduo tipoResiduo) {
        this.tipoResiduo = tipoResiduo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}
