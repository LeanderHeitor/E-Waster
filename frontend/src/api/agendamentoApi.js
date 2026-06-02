// 🚀 Alterado para importar o objeto 'api' customizado do seu http.js
import { api } from "./http";

export const agendamentoApi = {
  /**
   * Envia o agendamento com o formato Pai + Filhos para o Back-end
   * @param {number} slotId - O ID do slot escolhido
   * @param {Array<{tipoResiduoId: number, quantidade: number}>} itens - Os itens selecionados
   */
  criar: async (slotId, itens) => {
    // 🚀 Corrigido: Chamando a rota limpa.
    // O 'api.post' vai injetar automaticamente o /api/v1/agendamentos
    return api.post("/agendamentos", {
      slotId,
      itens
    });
  }
};