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

-- Tabela Estoque_vacina
CREATE TABLE Estoque_vacina (
    id_estoque_vacina SERIAL PRIMARY KEY,
    id_posto INT NOT NULL,
    quantidade_minima INT DEFAULT 0,
    quantidade_disponivel INT DEFAULT 0,
    data_validade TIMESTAMP,
    FOREIGN KEY (id_posto) REFERENCES Posto(id_posto) ON DELETE CASCADE
);

-- Tabela Vacina
CREATE TABLE Vacina (
    id_vacina SERIAL PRIMARY KEY,
    id_estoque_vacina INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255),
    doses_necessarias INT DEFAULT 1,
    FOREIGN KEY (id_estoque_vacina) REFERENCES Estoque_vacina(id_estoque_vacina) ON DELETE CASCADE
);

-- Tabela AplicacaoVacina
CREATE TABLE AplicacaoVacina (
    id_aplicacao SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_posto INT NOT NULL,
    id_profissional INT NOT NULL,
    data TIMESTAMP NOT NULL,
    numero_dose INT NOT NULL,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE CASCADE,
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
CREATE INDEX idx_aplicacao_paciente ON AplicacaoVacina(id_paciente);
CREATE INDEX idx_aplicacao_posto ON AplicacaoVacina(id_posto);
