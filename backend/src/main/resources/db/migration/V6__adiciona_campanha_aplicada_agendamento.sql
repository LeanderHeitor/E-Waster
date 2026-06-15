-- Snapshot da campanha aplicada na aprovação: congela o multiplicador e o nome da
-- campanha que deu o bônus, para "Meus Agendamentos" exibir a origem dos pontos
-- (valor original x multiplicador = valor final) mesmo que a campanha mude depois.
ALTER TABLE agendamento ADD COLUMN multiplicador DOUBLE PRECISION;
ALTER TABLE agendamento ADD COLUMN campanha_nome VARCHAR(255);
