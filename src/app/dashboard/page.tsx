"use client";

import {
  Activity,
  AlertTriangle,
  Calendar,
  FileText,
  Package,
  Pill,
  Syringe,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function DashboardPage() {
  const [postoNome, setPostoNome] = useState<string>("");

  useEffect(() => {
    const posto = localStorage.getItem("posto");
    if (posto) {
      const postoData = JSON.parse(posto) as { nome: string };
      setPostoNome(postoData.nome);
    }
  }, []);

  // Queries para estatísticas
  const { data: pacientes } = api.paciente.getAll.useQuery();
  const { data: consultas } = api.consulta.getAll.useQuery();
  const { data: profissionais } = api.profissional.getMyProfissionais.useQuery();
  const { data: agendamentos } = api.agendamento.getAll.useQuery();
  const { data: estoqueVacinas } = api.estoqueVacina.getAll.useQuery();
  const { data: estoqueMedicamentos } = api.estoqueMedicamentos.getAll.useQuery();
  const { data: aplicacoesVacina } = api.aplicacaoVacina.getAll.useQuery();
  const { data: prescricoes } = api.prescricao.getAll.useQuery();

  // Cálculos de estatísticas
  const totalPacientes = pacientes?.length ?? 0;
  const totalProfissionais = profissionais?.length ?? 0;
  const totalConsultas = consultas?.length ?? 0;

  // Agendamentos pendentes
  const agendamentosPendentes =
    agendamentos?.filter((a) => a.status === "Agendado").length ?? 0;

  // Consultas do mês atual
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const consultasMes =
    consultas?.filter((c) => new Date(c.data) >= primeiroDiaMes).length ?? 0;

  // Vacinas com estoque baixo
  const vacinasEstoqueBaixo =
    estoqueVacinas?.filter(
      (e) =>
        e.quantidade_disponivel !== null &&
        e.quantidade_minima !== null &&
        e.quantidade_disponivel <= e.quantidade_minima,
    ).length ?? 0;

  // Medicamentos com estoque baixo
  const medicamentosEstoqueBaixo =
    estoqueMedicamentos?.filter(
      (e) =>
        e.quantidade_atual !== null &&
        e.quantidade_minima !== null &&
        e.quantidade_atual <= e.quantidade_minima,
    ).length ?? 0;

  // Aplicações de vacina no mês
  const aplicacoesVacinaMes =
    aplicacoesVacina?.filter((a) => new Date(a.data) >= primeiroDiaMes)
      .length ?? 0;

  // Prescrições no mês
  const prescricoesMes =
    prescricoes?.filter((p) => new Date(p.data) >= primeiroDiaMes).length ?? 0;

  // Vacinas próximas ao vencimento (30 dias)
  const trintaDias = new Date();
  trintaDias.setDate(trintaDias.getDate() + 30);
  const vacinasVencendo =
    estoqueVacinas?.filter(
      (e) =>
        e.data_validade &&
        new Date(e.data_validade) <= trintaDias &&
        new Date(e.data_validade) >= hoje,
    ).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {postoNome
            ? `Bem-vindo ao ${postoNome}`
            : "Bem-vindo ao sistema de gerenciamento de saúde"}
        </p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPacientes}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profissionais Ativos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfissionais}</div>
            <p className="text-xs text-muted-foreground">
              Profissionais de saúde cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consultas (Mês)
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultasMes}</div>
            <p className="text-xs text-muted-foreground">
              De {totalConsultas} consultas totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Pendentes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agendamentosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atendimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Atividades Recentes e Alertas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vacinas Aplicadas</CardTitle>
              <CardDescription>Neste mês</CardDescription>
            </div>
            <Syringe className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aplicacoesVacinaMes}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total de aplicações registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Prescrições Emitidas</CardTitle>
              <CardDescription>Neste mês</CardDescription>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{prescricoesMes}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Receitas médicas geradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Estoque de Vacinas</CardTitle>
              <CardDescription>Status geral</CardDescription>
            </div>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {estoqueVacinas?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tipos de vacinas em estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Avisos */}
      {(vacinasEstoqueBaixo > 0 ||
        medicamentosEstoqueBaixo > 0 ||
        vacinasVencendo > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas Importantes
            </CardTitle>
            <CardDescription>
              Itens que requerem sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {vacinasEstoqueBaixo > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Syringe className="h-4 w-4 text-orange-600" />
                <span className="font-medium">
                  {vacinasEstoqueBaixo} vacina(s)
                </span>
                <span className="text-muted-foreground">
                  com estoque abaixo do mínimo
                </span>
              </div>
            )}
            {medicamentosEstoqueBaixo > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Pill className="h-4 w-4 text-orange-600" />
                <span className="font-medium">
                  {medicamentosEstoqueBaixo} medicamento(s)
                </span>
                <span className="text-muted-foreground">
                  com estoque abaixo do mínimo
                </span>
              </div>
            )}
            {vacinasVencendo > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-medium">{vacinasVencendo} vacina(s)</span>
                <span className="text-muted-foreground">
                  vencem nos próximos 30 dias
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Vacinas</CardTitle>
            <CardDescription>
              Controle completo do estoque e aplicações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Total em estoque:
              </span>
              <span className="font-medium">
                {estoqueVacinas?.length ?? 0} tipos
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Aplicações totais:
              </span>
              <span className="font-medium">
                {aplicacoesVacina?.length ?? 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Este mês:</span>
              <span className="font-medium">{aplicacoesVacinaMes}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Medicamentos</CardTitle>
            <CardDescription>
              Controle de medicamentos e prescrições
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Total em estoque:
              </span>
              <span className="font-medium">
                {estoqueMedicamentos?.length ?? 0} tipos
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Prescrições totais:
              </span>
              <span className="font-medium">{prescricoes?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Este mês:</span>
              <span className="font-medium">{prescricoesMes}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
