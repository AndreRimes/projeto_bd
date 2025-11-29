export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gerenciamento de saúde
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Vacinas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie o estoque e aplicação de vacinas
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Medicamentos</h3>
          <p className="text-sm text-muted-foreground">
            Controle de medicamentos e prescrições
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Estatísticas</h3>
          <p className="text-sm text-muted-foreground">
            Visualize relatórios e métricas
          </p>
        </div>
      </div>
    </div>
  );
}
