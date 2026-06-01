-- =========================================================
-- V2 — Schema do Sprint 2 (catalogo, slots, agendamento)
--
-- POR QUE CRIAR AQUI E NAO NO V1:
-- O V1__schema.sql foi marcado como "<< Flyway Baseline >>" (baseline-on-migrate)
-- e NUNCA chegou a ser executado pelo Flyway — apenas a tabela USUARIO existia
-- no banco. Portanto as tabelas abaixo precisam ser criadas por uma migration
-- forward (V2), e nao editando o V1 (que esta abaixo do baseline e seria ignorado).
--
-- Diferencas em relacao ao V1:
--  - tipo_residuo ganha a coluna "sigla" (usada no badge do front).
--  - cria a tabela "agendamento_item" (faltava no V1 — "Furo 1"), necessaria
--    para persistir os itens que o usuario declara em cada agendamento.
-- =========================================================

-- =========================
-- TIPO_RESIDUO (catalogo)
-- =========================
CREATE TABLE tipo_residuo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    pontuacao_base INT NOT NULL,
    sigla VARCHAR(10)
);

-- =========================
-- SLOT_COLETA
-- =========================
CREATE TABLE slot_coleta (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    capacidade_maxima INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- AGENDAMENTO
-- status: PENDENTE / CANCELADO / REALIZADO / NAO_COMPARECEU
-- (VARCHAR para casar com @Enumerated(EnumType.STRING))
-- =========================
CREATE TABLE agendamento (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    slot_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_agendamento_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_agendamento_slot
        FOREIGN KEY (slot_id) REFERENCES slot_coleta(id) ON DELETE RESTRICT
);

-- =========================
-- AGENDAMENTO_ITEM
-- itens que o usuario declara que vai entregar em um agendamento
-- =========================
CREATE TABLE agendamento_item (
    id SERIAL PRIMARY KEY,
    agendamento_id INT NOT NULL,
    tipo_residuo_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_item_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamento(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_tipo_residuo
        FOREIGN KEY (tipo_residuo_id) REFERENCES tipo_residuo(id) ON DELETE RESTRICT
);
