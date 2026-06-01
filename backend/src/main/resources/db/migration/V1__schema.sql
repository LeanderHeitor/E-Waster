-- =========================================================
-- V1 — Schema unico e completo do E-Waster
--
-- Fonte de verdade unificada (substitui o antigo V1 + V2__sprint2_schema):
--  - inclui a coluna tipo_residuo.sigla;
--  - inclui a tabela agendamento_item (antigo "Furo 1");
--  - bate 1:1 com as entidades JPA (ddl-auto: validate).
--
-- Enums (tipo do usuario, status do agendamento) sao VARCHAR para casar
-- com @Enumerated(EnumType.STRING).
-- =========================================================

-- =========================
-- USUARIO
-- =========================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    pontuacao_total INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
-- TIPO_RESIDUO (catalogo) — com sigla
-- =========================
CREATE TABLE tipo_residuo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    pontuacao_base INT NOT NULL,
    sigla VARCHAR(10)
);

-- =========================
-- CONQUISTA
-- =========================
CREATE TABLE conquista (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    valor INT NOT NULL
);

-- =========================
-- CAMPANHA
-- =========================
CREATE TABLE campanha (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL
);

-- =========================
-- AGENDAMENTO
-- status: PENDENTE / CANCELADO / REALIZADO / NAO_COMPARECEU
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

-- =========================
-- DESCARTE
-- =========================
CREATE TABLE descarte (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_residuo_id INT NOT NULL,
    agendamento_id INT,
    campanha_id INT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_descarte_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_descarte_tipo_residuo
        FOREIGN KEY (tipo_residuo_id) REFERENCES tipo_residuo(id) ON DELETE RESTRICT,
    CONSTRAINT fk_descarte_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamento(id) ON DELETE SET NULL,
    CONSTRAINT fk_descarte_campanha
        FOREIGN KEY (campanha_id) REFERENCES campanha(id) ON DELETE SET NULL
);

-- =========================
-- USUARIO_CONQUISTA
-- =========================
CREATE TABLE usuario_conquista (
    usuario_id INT NOT NULL,
    conquista_id INT NOT NULL,
    data_desbloqueio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, conquista_id),

    CONSTRAINT fk_uc_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_uc_conquista
        FOREIGN KEY (conquista_id) REFERENCES conquista(id) ON DELETE CASCADE
);

-- =========================
-- USUARIO_CAMPANHA
-- =========================
CREATE TABLE usuario_campanha (
    usuario_id INT NOT NULL,
    campanha_id INT NOT NULL,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, campanha_id),

    CONSTRAINT fk_ucamp_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_ucamp_campanha
        FOREIGN KEY (campanha_id) REFERENCES campanha(id) ON DELETE CASCADE
);
