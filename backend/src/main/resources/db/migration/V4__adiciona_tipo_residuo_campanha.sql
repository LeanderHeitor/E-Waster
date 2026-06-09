ALTER TABLE campanha
ADD COLUMN tipo_residuo_id INTEGER;

ALTER TABLE campanha
ADD CONSTRAINT fk_campanha_tipo_residuo
FOREIGN KEY (tipo_residuo_id)
REFERENCES tipo_residuo(id);