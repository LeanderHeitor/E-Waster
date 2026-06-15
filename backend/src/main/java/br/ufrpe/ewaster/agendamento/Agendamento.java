package br.ufrpe.ewaster.agendamento;
import java.util.List;
import br.ufrpe.ewaster.slot.SlotColeta;
import br.ufrpe.ewaster.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "agendamento")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "slot_id")
    private SlotColeta slot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAgendamento status;

    // Pontos congelados na aprovação (base * quantidade * multiplicador da campanha).
    // Fonte única da pontuação final exibida no ranking, na home e em "Meus Agendamentos".
    // Nulo enquanto o agendamento não foi aprovado (PENDENTE/CANCELADO/NAO_COMPARECEU).
    @Column(name = "total_pontos")
    private Integer totalPontos;

    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AgendamentoItem> itens = new java.util.ArrayList<>();

    public List<AgendamentoItem> getItens() {
        return itens;
    }

    public void setItens(List<AgendamentoItem> itens) {
        this.itens = itens;
    }

    public Agendamento() {
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

    public SlotColeta getSlot() {
        return slot;
    }

    public void setSlot(SlotColeta slot) {
        this.slot = slot;
    }

    public StatusAgendamento getStatus() {
        return status;
    }

    public void setStatus(StatusAgendamento status) {
        this.status = status;
    }

    public Integer getTotalPontos() {
        return totalPontos;
    }

    public void setTotalPontos(Integer totalPontos) {
        this.totalPontos = totalPontos;
    }
}
