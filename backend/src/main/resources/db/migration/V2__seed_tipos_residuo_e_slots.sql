-- =========================================================
-- V2 — Seed: 9 tipos de residuo + slots de coleta
-- Dados convertidos do antigo frontend/src/data/mockData.js.
-- =========================================================

-- 9 tipos de residuo (nome, pontuacao_base, sigla)
INSERT INTO tipo_residuo (nome, pontuacao_base, sigla) VALUES
    ('Celular/Smartphone',   15, 'CEL'),
    ('Notebook/Laptop',      25, 'NB'),
    ('Pilhas e Baterias',     5, 'PIL'),
    ('Cabos e Carregadores',  3, 'CAB'),
    ('Monitor/Tela',         20, 'MON'),
    ('Teclado/Mouse',         5, 'TEC'),
    ('Memoria RAM',           8, 'RAM'),
    ('Placa-mae',            12, 'MB'),
    ('HD/SSD',               10, 'HD');

-- Slots de coleta (manha 08-12 e tarde 13-17), capacidade 5 cada.
-- Datas futuras em relacao a 2026-06-01 (manutencao do seed: ajustar quando vencerem).
INSERT INTO slot_coleta (data, horario_inicio, horario_fim, capacidade_maxima, ativo) VALUES
    ('2026-06-02', '08:00', '12:00', 5, TRUE),
    ('2026-06-02', '13:00', '17:00', 5, TRUE),
    ('2026-06-03', '08:00', '12:00', 5, TRUE),
    ('2026-06-03', '13:00', '17:00', 5, TRUE),
    ('2026-06-04', '08:00', '12:00', 5, TRUE),
    ('2026-06-04', '13:00', '17:00', 5, TRUE);
