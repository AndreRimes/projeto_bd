-- Alterar coluna foto de VARCHAR(255) para TEXT para suportar base64
-- Esta migração é necessária apenas se a tabela já existir com o tipo VARCHAR(255)

ALTER TABLE Paciente 
ALTER COLUMN foto TYPE TEXT;
