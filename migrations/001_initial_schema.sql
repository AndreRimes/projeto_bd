-- Tabela Posto
CREATE TABLE Posto (
    id_posto SERIAL PRIMARY KEY,
    ativo BOOLEAN DEFAULT true,
    telefone VARCHAR(50),
    endereco VARCHAR(255),
    nome VARCHAR(255) UNIQUE NOT NULL,
    matricula VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Tabela Profissional
CREATE TABLE Profissional (
    id_profissional SERIAL PRIMARY KEY,
    id_posto INT NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(255),
    tipo VARCHAR(50),
    FOREIGN KEY (id_posto) REFERENCES Posto(id_posto) ON DELETE CASCADE
);

-- Tabela Consulta
CREATE TABLE Consulta (
    id_consulta SERIAL PRIMARY KEY,
    id_profissional INT NOT NULL,
    observacoes TEXT,
    diagnostico TEXT,
    sintomas TEXT,
    data TIMESTAMP NOT NULL,
    FOREIGN KEY (id_profissional) REFERENCES Profissional(id_profissional) ON DELETE CASCADE
);

-- Tabela Prescricao
CREATE TABLE Prescricao (
    id_prescricao SERIAL PRIMARY KEY,
    id_consulta INT NOT NULL,
    data TIMESTAMP NOT NULL,
    conteudo TEXT,
    FOREIGN KEY (id_consulta) REFERENCES Consulta(id_consulta) ON DELETE CASCADE
);

-- Tabela Medicamento
CREATE TABLE Medicamento (
    id_medicamento SERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela Estoque_medicamentos
CREATE TABLE Estoque_medicamentos (
    id_estoque SERIAL PRIMARY KEY,
    id_posto INT NOT NULL,
    id_medicamento INT NOT NULL,
    quantidade_atual INT DEFAULT 0,
    quantidade_minima INT DEFAULT 0,
    data_validade TIMESTAMP,
    FOREIGN KEY (id_posto) REFERENCES Posto(id_posto) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE CASCADE
);

-- Tabela Paciente
CREATE TABLE Paciente (
    id_paciente SERIAL PRIMARY KEY,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    endereco VARCHAR(255),
    data_nasc DATE,
    foto VARCHAR(255)
);

-- Tabela Agendamento
CREATE TABLE Agendamento (
    id_agendamento SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_consulta INT NOT NULL,
    motivo TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    data TIMESTAMP NOT NULL,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_consulta) REFERENCES Consulta(id_consulta) ON DELETE CASCADE
);

-- Tabela Vacina
CREATE TABLE Vacina (
    id_vacina SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255),
    doses_necessarias INT DEFAULT 1
);

-- Tabela Estoque_vacina
CREATE TABLE Estoque_vacina (
    id_estoque_vacina SERIAL PRIMARY KEY,
    id_posto INT NOT NULL,
    id_vacina INT NOT NULL,
    quantidade_minima INT DEFAULT 0,
    quantidade_disponivel INT DEFAULT 0,
    data_validade TIMESTAMP,
    FOREIGN KEY (id_posto) REFERENCES Posto(id_posto) ON DELETE CASCADE,
    FOREIGN KEY (id_vacina) REFERENCES Vacina(id_vacina) ON DELETE CASCADE
);

-- Tabela AplicacaoVacina
CREATE TABLE AplicacaoVacina (
    id_aplicacao SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_vacina INT NOT NULL,
    id_posto INT NOT NULL,
    id_profissional INT NOT NULL,
    data TIMESTAMP NOT NULL,
    numero_dose INT NOT NULL,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE CASCADE,
    FOREIGN KEY (id_vacina) REFERENCES Vacina(id_vacina) ON DELETE CASCADE,
    FOREIGN KEY (id_posto) REFERENCES Posto(id_posto) ON DELETE CASCADE,
    FOREIGN KEY (id_profissional) REFERENCES Profissional(id_profissional) ON DELETE CASCADE
);

-- Tabela Prescreve (relação muitos-para-muitos)
CREATE TABLE Prescreve (
    id_medicamento INT NOT NULL,
    id_prescricao INT NOT NULL,
    PRIMARY KEY(id_medicamento, id_prescricao),
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE CASCADE,
    FOREIGN KEY (id_prescricao) REFERENCES Prescricao(id_prescricao) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_profissional_posto ON Profissional(id_posto);
CREATE INDEX idx_consulta_profissional ON Consulta(id_profissional);
CREATE INDEX idx_prescricao_consulta ON Prescricao(id_consulta);
CREATE INDEX idx_estoque_med_posto ON Estoque_medicamentos(id_posto);
CREATE INDEX idx_estoque_med_medicamento ON Estoque_medicamentos(id_medicamento);
CREATE INDEX idx_agendamento_paciente ON Agendamento(id_paciente);
CREATE INDEX idx_agendamento_consulta ON Agendamento(id_consulta);
CREATE INDEX idx_estoque_vacina_posto ON Estoque_vacina(id_posto);
CREATE INDEX idx_estoque_vacina_vacina ON Estoque_vacina(id_vacina);
CREATE INDEX idx_aplicacao_paciente ON AplicacaoVacina(id_paciente);
CREATE INDEX idx_aplicacao_vacina ON AplicacaoVacina(id_vacina);
CREATE INDEX idx_aplicacao_posto ON AplicacaoVacina(id_posto);

-- View: Agendamentos com detalhes completos
CREATE VIEW vw_agendamentos_detalhados AS
SELECT 
    a.id_agendamento,
    a.data AS data_agendamento,
    a.motivo,
    a.status,
    p.id_paciente,
    p.nome AS nome_paciente,
    p.cpf AS cpf_paciente,
    p.telefone AS telefone_paciente,
    c.id_consulta,
    c.data AS data_consulta,
    c.diagnostico,
    c.sintomas,
    c.observacoes,
    prof.id_profissional,
    prof.nome AS nome_profissional,
    prof.especialidade,
    posto.id_posto,
    posto.nome AS nome_posto
FROM Agendamento a
JOIN Paciente p ON a.id_paciente = p.id_paciente
JOIN Consulta c ON a.id_consulta = c.id_consulta
JOIN Profissional prof ON c.id_profissional = prof.id_profissional
JOIN Posto posto ON prof.id_posto = posto.id_posto;

-- Procedure: Registrar aplicação de vacina e atualizar estoque
CREATE OR REPLACE FUNCTION sp_registrar_aplicacao_vacina(
    p_id_paciente INT,
    p_id_vacina INT,
    p_id_posto INT,
    p_id_profissional INT,
    p_data TIMESTAMP,
    p_numero_dose INT
) RETURNS TABLE(
    id_aplicacao INT,
    sucesso BOOLEAN,
    mensagem TEXT
) AS $$
DECLARE
    v_id_aplicacao INT;
    v_quantidade_disponivel INT;
    v_id_estoque_vacina INT;
BEGIN
    -- Verificar se existe estoque da vacina no posto
    SELECT id_estoque_vacina, quantidade_disponivel 
    INTO v_id_estoque_vacina, v_quantidade_disponivel
    FROM Estoque_vacina
    WHERE id_posto = p_id_posto AND id_vacina = p_id_vacina;

    -- Se não existe estoque, retornar erro
    IF v_id_estoque_vacina IS NULL THEN
        RETURN QUERY SELECT NULL::INT, FALSE, 'Vacina não disponível no estoque deste posto'::TEXT;
        RETURN;
    END IF;

    -- Verificar se há quantidade disponível
    IF v_quantidade_disponivel <= 0 THEN
        RETURN QUERY SELECT NULL::INT, FALSE, 'Estoque insuficiente da vacina'::TEXT;
        RETURN;
    END IF;

    -- Inserir a aplicação da vacina
    INSERT INTO AplicacaoVacina (id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose)
    VALUES (p_id_paciente, p_id_vacina, p_id_posto, p_id_profissional, p_data, p_numero_dose)
    RETURNING AplicacaoVacina.id_aplicacao INTO v_id_aplicacao;

    -- Atualizar o estoque (decrementar)
    UPDATE Estoque_vacina
    SET quantidade_disponivel = quantidade_disponivel - 1
    WHERE id_estoque_vacina = v_id_estoque_vacina;

    -- Retornar sucesso
    RETURN QUERY SELECT v_id_aplicacao, TRUE, 'Aplicação registrada e estoque atualizado com sucesso'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Atualizar status do agendamento quando consulta for concluída
CREATE OR REPLACE FUNCTION trg_atualizar_status_agendamento()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o diagnóstico foi preenchido/atualizado, marca o agendamento como concluído
    IF NEW.diagnostico IS NOT NULL AND NEW.diagnostico != '' THEN
        UPDATE Agendamento
        SET status = 'concluido'
        WHERE id_consulta = NEW.id_consulta
        AND status != 'concluido';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_agendamento_apos_consulta
AFTER INSERT OR UPDATE OF diagnostico ON Consulta
FOR EACH ROW
EXECUTE FUNCTION trg_atualizar_status_agendamento();
