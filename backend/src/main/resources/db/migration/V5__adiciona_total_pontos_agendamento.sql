-- Pontos efetivamente concedidos quando o agendamento foi aprovado (REALIZADO),
-- já com o multiplicador de campanha aplicado. Congelados no momento da aprovação
-- para que ranking, página inicial e "Meus Agendamentos" exibam o mesmo valor final.
ALTER TABLE agendamento
ADD COLUMN total_pontos INT;
