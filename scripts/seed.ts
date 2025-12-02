import bcrypt from "bcryptjs";
import "dotenv/config";
import { Pool } from "pg";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Limpar dados existentes
    await db.query("DELETE FROM Prescreve");
    await db.query("DELETE FROM Prescricao");
    await db.query("DELETE FROM AplicacaoVacina");
    await db.query("DELETE FROM Agendamento");
    await db.query("DELETE FROM Consulta");
    await db.query("DELETE FROM Estoque_vacina");
    await db.query("DELETE FROM Estoque_medicamentos");
    await db.query("DELETE FROM Profissional");
    await db.query("DELETE FROM Paciente");
    await db.query("DELETE FROM Vacina");
    await db.query("DELETE FROM Medicamento");
    await db.query("DELETE FROM Posto");
    console.log("🗑️  Dados existentes deletados");

    // Criar 5 Postos
    const postos = [];
    const postosData = [
      {
        nome: "Posto Central",
        matricula: "POSTO001",
        senha: "admin123",
        telefone: "(11) 98765-4321",
        endereco: "Rua das Flores, 123 - Centro",
      },
      {
        nome: "Posto Norte",
        matricula: "POSTO002",
        senha: "norte123",
        telefone: "(11) 91234-5678",
        endereco: "Av. Norte, 456 - Zona Norte",
      },
      {
        nome: "Posto Sul",
        matricula: "POSTO003",
        senha: "sul123",
        telefone: "(11) 95678-1234",
        endereco: "Av. Sul, 789 - Zona Sul",
      },
      {
        nome: "Posto Leste",
        matricula: "POSTO004",
        senha: "leste123",
        telefone: "(11) 93456-7890",
        endereco: "Rua Leste, 321 - Zona Leste",
      },
      {
        nome: "Posto Oeste",
        matricula: "POSTO005",
        senha: "oeste123",
        telefone: "(11) 97890-1234",
        endereco: "Av. Oeste, 654 - Zona Oeste",
      },
    ];

    for (const posto of postosData) {
      const senhaHash = await bcrypt.hash(posto.senha, 10);
      const result = await db.query(
        `INSERT INTO Posto (nome, matricula, senha, telefone, endereco, ativo)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id_posto, nome, matricula`,
        [
          posto.nome,
          posto.matricula,
          senhaHash,
          posto.telefone,
          posto.endereco,
          true,
        ],
      );
      postos.push(result.rows[0]);
      console.log(
        `✅ ${posto.nome} criado - Matrícula: ${posto.matricula} | Senha: ${posto.senha}`,
      );
    }

    const primeiroPosto = postos[0]!.id_posto;

    // Criar 5 Profissionais para o primeiro posto
    const profissionais = [];
    const profissionaisData = [
      {
        cpf: "111.111.111-11",
        nome: "Dr. João Silva",
        especialidade: "Clínico Geral",
        tipo: "Médico",
      },
      {
        cpf: "222.222.222-22",
        nome: "Dra. Maria Santos",
        especialidade: "Pediatria",
        tipo: "Médico",
      },
      {
        cpf: "333.333.333-33",
        nome: "Dr. Pedro Oliveira",
        especialidade: "Cardiologia",
        tipo: "Médico",
      },
      {
        cpf: "444.444.444-44",
        nome: "Enf. Ana Costa",
        especialidade: "Enfermagem",
        tipo: "Enfermeiro",
      },
      {
        cpf: "555.555.555-55",
        nome: "Enf. Carlos Souza",
        especialidade: "Enfermagem",
        tipo: "Enfermeiro",
      },
    ];

    for (const prof of profissionaisData) {
      const result = await db.query(
        `INSERT INTO Profissional (id_posto, cpf, nome, especialidade, tipo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_profissional`,
        [primeiroPosto, prof.cpf, prof.nome, prof.especialidade, prof.tipo],
      );
      profissionais.push(result.rows[0]!.id_profissional);
    }
    console.log(`✅ ${profissionais.length} profissionais criados`);

    // Criar 5 Pacientes
    const pacientes = [];
    const pacientesData = [
      {
        cpf: "123.456.789-01",
        nome: "José da Silva",
        telefone: "(11) 91111-1111",
        endereco: "Rua A, 100",
        data_nasc: "1965-03-15",
      },
      {
        cpf: "234.567.890-12",
        nome: "Maria Oliveira",
        telefone: "(11) 92222-2222",
        endereco: "Rua B, 200",
        data_nasc: "1988-07-22",
      },
      {
        cpf: "345.678.901-23",
        nome: "Paulo Santos",
        telefone: "(11) 93333-3333",
        endereco: "Rua C, 300",
        data_nasc: "1972-11-10",
      },
      {
        cpf: "456.789.012-34",
        nome: "Ana Costa",
        telefone: "(11) 94444-4444",
        endereco: "Rua D, 400",
        data_nasc: "1995-05-18",
      },
      {
        cpf: "567.890.123-45",
        nome: "Carlos Pereira",
        telefone: "(11) 95555-5555",
        endereco: "Rua E, 500",
        data_nasc: "1982-09-25",
      },
    ];

    for (const pac of pacientesData) {
      const result = await db.query(
        `INSERT INTO Paciente (cpf, nome, telefone, endereco, data_nasc)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_paciente`,
        [pac.cpf, pac.nome, pac.telefone, pac.endereco, pac.data_nasc],
      );
      pacientes.push(result.rows[0]!.id_paciente);
    }
    console.log(`✅ ${pacientes.length} pacientes criados`);

    // Criar 5 Consultas
    const consultas = [];
    const consultasData = [
      {
        id_profissional: profissionais[0],
        observacoes: "Paciente com febre",
        diagnostico: "Gripe",
        sintomas: "Febre, tosse, dor de cabeça",
        data: "2025-11-25 10:00:00", // Consulta passada - tem diagnóstico
      },
      {
        id_profissional: profissionais[1],
        observacoes: "Consulta de rotina",
        diagnostico: "Saudável",
        sintomas: "Nenhum",
        data: "2025-11-28 14:00:00", // Consulta passada - tem diagnóstico
      },
      {
        id_profissional: profissionais[2],
        observacoes: "Pressão alta",
        diagnostico: null, // Consulta futura - sem diagnóstico ainda
        sintomas: "Dor de cabeça, tontura",
        data: "2025-12-15 09:00:00",
      },
      {
        id_profissional: profissionais[0],
        observacoes: "Dor abdominal",
        diagnostico: null, // Consulta futura - sem diagnóstico ainda
        sintomas: "Dor no estômago, azia",
        data: "2025-12-20 11:00:00",
      },
      {
        id_profissional: profissionais[1],
        observacoes: "Vacinação infantil",
        diagnostico: null, // Consulta de vacinação - não tem diagnóstico
        sintomas: "Nenhum",
        data: "2026-01-08 15:00:00",
      },
    ];

    for (const cons of consultasData) {
      const result = await db.query(
        `INSERT INTO Consulta (id_profissional, observacoes, diagnostico, sintomas, data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_consulta`,
        [
          cons.id_profissional,
          cons.observacoes,
          cons.diagnostico,
          cons.sintomas,
          cons.data,
        ],
      );
      consultas.push(result.rows[0]!.id_consulta);
    }
    console.log(`✅ ${consultas.length} consultas criadas`);

    // Criar 5 Agendamentos
    const agendamentosData = [
      {
        id_paciente: pacientes[0],
        id_consulta: consultas[0],
        motivo: "Consulta de rotina",
        status: "concluido", // Consulta já realizada
        data: "2025-11-25 10:00:00",
      },
      {
        id_paciente: pacientes[1],
        id_consulta: consultas[1],
        motivo: "Check-up",
        status: "concluido", // Consulta já realizada
        data: "2025-11-28 14:00:00",
      },
      {
        id_paciente: pacientes[2],
        id_consulta: consultas[2],
        motivo: "Pressão alta",
        status: "pendente", // Consulta futura
        data: "2025-12-15 09:00:00",
      },
      {
        id_paciente: pacientes[3],
        id_consulta: consultas[3],
        motivo: "Dor no estômago",
        status: "pendente", // Consulta futura
        data: "2025-12-20 11:00:00",
      },
      {
        id_paciente: pacientes[4],
        id_consulta: consultas[4],
        motivo: "Vacinação",
        status: "pendente", // Consulta futura
        data: "2026-01-08 15:00:00",
      },
    ];

    for (const agend of agendamentosData) {
      await db.query(
        `INSERT INTO Agendamento (id_paciente, id_consulta, motivo, status, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          agend.id_paciente,
          agend.id_consulta,
          agend.motivo,
          agend.status,
          agend.data,
        ],
      );
    }
    console.log(`✅ ${agendamentosData.length} agendamentos criados`);

    // Criar 5 Medicamentos
    const medicamentos = [];
    const medicamentosData = [
      "Paracetamol",
      "Ibuprofeno",
      "Amoxicilina",
      "Dipirona",
      "Omeprazol",
    ];

    for (const med of medicamentosData) {
      const result = await db.query(
        `INSERT INTO Medicamento (nome) VALUES ($1) RETURNING id_medicamento`,
        [med],
      );
      medicamentos.push(result.rows[0]!.id_medicamento);
    }
    console.log(`✅ ${medicamentos.length} medicamentos criados`);

    // Criar 5 Estoques de Medicamentos
    const estoqueMedData = [
      {
        id_medicamento: medicamentos[0],
        quantidade_atual: 100,
        quantidade_minima: 20,
        data_validade: "2026-12-31",
      },
      {
        id_medicamento: medicamentos[1],
        quantidade_atual: 50,
        quantidade_minima: 15,
        data_validade: "2026-06-15",
      },
      {
        id_medicamento: medicamentos[2],
        quantidade_atual: 30,
        quantidade_minima: 10,
        data_validade: "2026-03-20",
      },
      {
        id_medicamento: medicamentos[3],
        quantidade_atual: 80,
        quantidade_minima: 25,
        data_validade: "2027-01-30",
      },
      {
        id_medicamento: medicamentos[4],
        quantidade_atual: 15,
        quantidade_minima: 20,
        data_validade: "2025-12-15",
      },
    ];

    for (const est of estoqueMedData) {
      await db.query(
        `INSERT INTO Estoque_medicamentos (id_posto, id_medicamento, quantidade_atual, quantidade_minima, data_validade)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          primeiroPosto,
          est.id_medicamento,
          est.quantidade_atual,
          est.quantidade_minima,
          est.data_validade,
        ],
      );
    }
    console.log(`✅ ${estoqueMedData.length} estoques de medicamentos criados`);

    // Criar 5 Vacinas
    const vacinas = [];
    const vacinasData = [
      { nome: "BCG", fabricante: "Instituto Butantan", doses_necessarias: 1 },
      { nome: "Hepatite B", fabricante: "Fiocruz", doses_necessarias: 3 },
      { nome: "Tríplice Viral", fabricante: "GSK", doses_necessarias: 2 },
      {
        nome: "Febre Amarela",
        fabricante: "Bio-Manguinhos",
        doses_necessarias: 1,
      },
      { nome: "COVID-19", fabricante: "Pfizer", doses_necessarias: 2 },
    ];

    for (const vac of vacinasData) {
      const result = await db.query(
        `INSERT INTO Vacina (nome, fabricante, doses_necessarias)
         VALUES ($1, $2, $3)
         RETURNING id_vacina`,
        [vac.nome, vac.fabricante, vac.doses_necessarias],
      );
      vacinas.push(result.rows[0]!.id_vacina);
    }
    console.log(`✅ ${vacinas.length} vacinas criadas`);

    // Criar 5 Estoques de Vacinas
    const estoqueVacData = [
      {
        id_vacina: vacinas[0],
        quantidade_disponivel: 200,
        quantidade_minima: 50,
        data_validade: "2026-12-31",
      },
      {
        id_vacina: vacinas[1],
        quantidade_disponivel: 150,
        quantidade_minima: 40,
        data_validade: "2026-06-30",
      },
      {
        id_vacina: vacinas[2],
        quantidade_disponivel: 100,
        quantidade_minima: 30,
        data_validade: "2026-03-15",
      },
      {
        id_vacina: vacinas[3],
        quantidade_disponivel: 80,
        quantidade_minima: 25,
        data_validade: "2027-03-20",
      },
      {
        id_vacina: vacinas[4],
        quantidade_disponivel: 45,
        quantidade_minima: 50,
        data_validade: "2025-12-30",
      },
    ];

    for (const est of estoqueVacData) {
      await db.query(
        `INSERT INTO Estoque_vacina (id_posto, id_vacina, quantidade_disponivel, quantidade_minima, data_validade)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          primeiroPosto,
          est.id_vacina,
          est.quantidade_disponivel,
          est.quantidade_minima,
          est.data_validade,
        ],
      );
    }
    console.log(`✅ ${estoqueVacData.length} estoques de vacinas criados`);

    // Criar 5 Aplicações de Vacina
    const aplicacoesData = [
      {
        id_paciente: pacientes[0],
        id_vacina: vacinas[0],
        id_profissional: profissionais[3],
        data: "2025-12-02 09:00:00",
        numero_dose: 1,
      },
      {
        id_paciente: pacientes[1],
        id_vacina: vacinas[1],
        id_profissional: profissionais[4],
        data: "2025-12-06 10:00:00",
        numero_dose: 1,
      },
      {
        id_paciente: pacientes[2],
        id_vacina: vacinas[2],
        id_profissional: profissionais[3],
        data: "2025-12-12 11:00:00",
        numero_dose: 1,
      },
      {
        id_paciente: pacientes[3],
        id_vacina: vacinas[3],
        id_profissional: profissionais[4],
        data: "2025-12-18 14:00:00",
        numero_dose: 1,
      },
      {
        id_paciente: pacientes[4],
        id_vacina: vacinas[4],
        id_profissional: profissionais[3],
        data: "2025-12-22 15:00:00",
        numero_dose: 1,
      },
    ];

    for (const aplic of aplicacoesData) {
      await db.query(
        `INSERT INTO AplicacaoVacina (id_paciente, id_vacina, id_posto, id_profissional, data, numero_dose)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          aplic.id_paciente,
          aplic.id_vacina,
          primeiroPosto,
          aplic.id_profissional,
          aplic.data,
          aplic.numero_dose,
        ],
      );
    }
    console.log(`✅ ${aplicacoesData.length} aplicações de vacina criadas`);

    // Criar 5 Prescrições
    const prescricoes = [];
    const prescricoesData = [
      {
        id_consulta: consultas[0],
        data: "2025-11-25 10:30:00",
        conteudo: "Paracetamol 500mg - 1 comprimido a cada 6 horas",
      },
      {
        id_consulta: consultas[1],
        data: "2025-11-28 14:30:00",
        conteudo: "Complexo vitamínico - 1 cápsula ao dia",
      },
      {
        id_consulta: consultas[0],
        data: "2025-11-25 10:35:00",
        conteudo: "Dipirona 500mg - 1 comprimido se necessário",
      },
      {
        id_consulta: consultas[1],
        data: "2025-11-28 14:35:00",
        conteudo: "Ibuprofeno 400mg - 1 comprimido a cada 8 horas se dor",
      },
      {
        id_consulta: consultas[0],
        data: "2025-11-25 10:40:00",
        conteudo: "Repouso e hidratação abundante",
      },
    ];

    for (const presc of prescricoesData) {
      const result = await db.query(
        `INSERT INTO Prescricao (id_consulta, data, conteudo)
         VALUES ($1, $2, $3)
         RETURNING id_prescricao`,
        [presc.id_consulta, presc.data, presc.conteudo],
      );
      prescricoes.push(result.rows[0]!.id_prescricao);
    }
    console.log(`✅ ${prescricoes.length} prescrições criadas`);

    // Criar relacionamentos Prescreve (medicamentos nas prescrições)
    const prescreveData = [
      { id_medicamento: medicamentos[0], id_prescricao: prescricoes[0] }, // Paracetamol
      { id_medicamento: medicamentos[3], id_prescricao: prescricoes[2] }, // Dipirona
      { id_medicamento: medicamentos[1], id_prescricao: prescricoes[3] }, // Ibuprofeno
      { id_medicamento: medicamentos[2], id_prescricao: prescricoes[1] }, // Amoxicilina
      { id_medicamento: medicamentos[4], id_prescricao: prescricoes[1] }, // Omeprazol
    ];

    for (const pres of prescreveData) {
      await db.query(
        `INSERT INTO Prescreve (id_medicamento, id_prescricao)
         VALUES ($1, $2)`,
        [pres.id_medicamento, pres.id_prescricao],
      );
    }
    console.log(
      `✅ ${prescreveData.length} relacionamentos medicamento-prescrição criados`,
    );

    console.log("\n✅ Seed concluído com sucesso!");
    console.log("\n📝 Postos disponíveis para login:");
    console.log(
      "   1. Matrícula: POSTO001 | Senha: admin123 (Posto Central - com todos os dados)",
    );
    console.log("   2. Matrícula: POSTO002 | Senha: norte123 (Posto Norte)");
    console.log("   3. Matrícula: POSTO003 | Senha: sul123 (Posto Sul)");
    console.log("   4. Matrícula: POSTO004 | Senha: leste123 (Posto Leste)");
    console.log("   5. Matrícula: POSTO005 | Senha: oeste123 (Posto Oeste)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seed();
