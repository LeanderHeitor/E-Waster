import { api } from "./http";

// Catalogo de tipos de residuo (GET /tipos-residuo, exige JWT).
// Normaliza pontuacaoBase -> pontos para a UI continuar usando `item.pontos`.
export function listarTiposResiduo() {
  return api.get("/tipos-residuo").then((lista) =>
    lista.map((t) => ({
      id: t.id,
      nome: t.nome,
      sigla: t.sigla,
      pontos: t.pontuacaoBase,
    }))
  );
}
