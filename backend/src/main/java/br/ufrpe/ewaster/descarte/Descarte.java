package br.ufrpe.ewaster.descarte;

import br.ufrpe.ewaster.agendamento.Agendamento;
import br.ufrpe.ewaster.tiporesiduo.TipoResiduo;
import br.ufrpe.ewaster.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Registro de um descarte efetivado (validado pelo admin). Mapeia a tabela
 * `descarte` ja existente no schema (V1). A coluna campanha_id fica nula no MVP.
 */
@Entity
@Table(name = "descarte")
public class Descarte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_residuo_id")
    private TipoResiduo tipoResiduo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @Column(name = "data_registro")
    private LocalDateTime dataRegistro;

    public Descarte() {
    }

    public Descarte(User usuario, TipoResiduo tipoResiduo, Agendamento agendamento) {
        this.usuario = usuario;
        this.tipoResiduo = tipoResiduo;
        this.agendamento = agendamento;
    }

    @PrePersist
    public void prePersist() {
        if (this.dataRegistro == null) {
            this.dataRegistro = LocalDateTime.now();
        }
    }

    public Integer getId() {
        return id;
    }

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public TipoResiduo getTipoResiduo() {
        return tipoResiduo;
    }

    public void setTipoResiduo(TipoResiduo tipoResiduo) {
        this.tipoResiduo = tipoResiduo;
    }

    public Agendamento getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(Agendamento agendamento) {
        this.agendamento = agendamento;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }
}
