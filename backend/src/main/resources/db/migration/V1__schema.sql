-- =========================================================
-- V1 — Schema Unificado do E-Waster
-- =========================================================

CREATE TABLE USUARIO (
                         id SERIAL PRIMARY KEY,
                         nome VARCHAR(255) NOT NULL,
                         email VARCHAR(255) NOT NULL UNIQUE,
                         senha VARCHAR(255) NOT NULL,
                         tipo VARCHAR(20) NOT NULL,
                         pontuacao_total INT DEFAULT 0,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SLOT_COLETA (
                             id SERIAL PRIMARY KEY,
                             data DATE NOT NULL,
                             horario_inicio TIME NOT NULL,
                             horario_fim TIME NOT NULL,
                             capacidade_maxima INT NOT NULL,
                             ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE TIPO_RESIDUO (
                              id SERIAL PRIMARY KEY,
                              nome VARCHAR(255) NOT NULL,
                              pontuacao_base INT NOT NULL,
                              sigla VARCHAR(10) -- <--- Adicionado aqui para casar com o Java!
);

CREATE TABLE CONQUISTA (
                           id SERIAL PRIMARY KEY,
                           nome VARCHAR(255) NOT NULL,
                           tipo VARCHAR(50) NOT NULL,
                           valor INT NOT NULL
);

CREATE TABLE CAMPANHA (
                          id SERIAL PRIMARY KEY,
                          nome VARCHAR(255) NOT NULL,
                          data_inicio DATE NOT NULL,
                          data_fim DATE NOT NULL
);

CREATE TABLE AGENDAMENTO (
                             id SERIAL PRIMARY KEY,
                             usuario_id INT NOT NULL,
                             slot_id INT NOT NULL,
                             status VARCHAR(20) NOT NULL,
                             FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE,
                             FOREIGN KEY (slot_id) REFERENCES SLOT_COLETA(id) ON DELETE RESTRICT
);

-- <--- Tabela agendamento_item adicionada aqui para evitar duplicidade posterior
CREATE TABLE agendamento_item (
                                  id SERIAL PRIMARY KEY,
                                  agendamento_id INT NOT NULL,
                                  tipo_residuo_id INT NOT NULL,
                                  quantidade INT NOT NULL DEFAULT 1,
                                  CONSTRAINT fk_item_agendamento FOREIGN KEY (agendamento_id) REFERENCES AGENDAMENTO(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_item_tipo_residuo FOREIGN KEY (tipo_residuo_id) REFERENCES TIPO_RESIDUO(id) ON DELETE RESTRICT
);

CREATE TABLE DESCARTE (
                          id SERIAL PRIMARY KEY,
                          usuario_id INT NOT NULL,
                          tipo_residuo_id INT NOT NULL,
                          agendamento_id INT,
                          campanha_id INT,
                          data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE,
                          FOREIGN KEY (tipo_residuo_id) REFERENCES TIPO_RESIDUO(id) ON DELETE RESTRICT,
                          FOREIGN KEY (agendamento_id) REFERENCES AGENDAMENTO(id) ON DELETE SET NULL,
                          FOREIGN KEY (campanha_id) REFERENCES CAMPANHA(id) ON DELETE SET NULL
);

CREATE TABLE USUARIO_CONQUISTA (
                                   usuario_id INT NOT NULL,
                                   conquista_id INT NOT NULL,
                                   data_desbloqueio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   PRIMARY KEY (usuario_id, conquista_id),
                                   FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE,
                                   FOREIGN KEY (conquista_id) REFERENCES CONQUISTA(id) ON DELETE CASCADE
);

CREATE TABLE USUARIO_CAMPANHA (
                                  usuario_id INT NOT NULL,
                                  campanha_id INT NOT NULL,
                                  data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (usuario_id, campanha_id),
                                  FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE,
                                  FOREIGN KEY (campanha_id) REFERENCES CAMPANHA(id) ON DELETE CASCADE
);