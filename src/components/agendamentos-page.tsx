"use client";

import { Calendar, ChevronLeft, ChevronRight, List, Pencil, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";

const agendamentoSchema = z.object({
  id_paciente: z.number().positive("Paciente é obrigatório"),
  id_profissional: z.number().positive("Profissional é obrigatório"),
  motivo: z.string().optional(),
  status: z.string().optional(),
  data: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  observacoes: z.string().optional(),
  diagnostico: z.string().optional(),
  sintomas: z.string().optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

export function AgendamentosPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<{
    id_agendamento: number;
    id_paciente: number;
    id_consulta: number;
    motivo: string | null;
    status: string;
    data: Date;
  } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState<{
    id_paciente: string;
    id_profissional: string;
    motivo: string;
    status: string;
    data: string;
    observacoes: string;
    diagnostico: string;
    sintomas: string;
  }>({
    id_paciente: "",
    id_profissional: "",
    motivo: "",
    status: "pendente",
    data: "",
    observacoes: "",
    diagnostico: "",
    sintomas: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    id_paciente?: string;
    id_profissional?: string;
    motivo?: string;
    status?: string;
    data?: string;
    observacoes?: string;
    diagnostico?: string;
    sintomas?: string;
  }>({});

  const utils = api.useUtils();

  const { data: agendamentos, isLoading } = api.agendamento.getAll.useQuery();
  const { data: pacientes } = api.paciente.getAll.useQuery();
  const { data: profissionais } = api.profissional.getMyProfissionais.useQuery();

  const createMutation = api.agendamento.create.useMutation({
    onSuccess: () => {
      utils.agendamento.getAll.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.agendamento.update.useMutation({
    onSuccess: () => {
      utils.agendamento.getAll.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedAgendamento(null);
    },
  });

  const deleteMutation = api.agendamento.delete.useMutation({
    onSuccess: () => {
      utils.agendamento.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedAgendamento(null);
    },
  });

  const resetForm = () => {
    setFormData({
      id_paciente: "",
      id_profissional: "",
      motivo: "",
      status: "pendente",
      data: "",
      observacoes: "",
      diagnostico: "",
      sintomas: "",
    });
    setValidationErrors({});
  };

  const handleCreate = async () => {
    setValidationErrors({});
    try {
      const validatedData = agendamentoSchema.parse({
        id_paciente: parseInt(formData.id_paciente),
        id_profissional: parseInt(formData.id_profissional),
        motivo: formData.motivo || undefined,
        status: formData.status || undefined,
        data: new Date(formData.data),
        observacoes: formData.observacoes || undefined,
        diagnostico: formData.diagnostico || undefined,
        sintomas: formData.sintomas || undefined,
      });
      await createMutation.mutateAsync(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: typeof validationErrors = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof typeof validationErrors;
          if (field) {
            errors[field] = error.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedAgendamento) return;
    setValidationErrors({});
    try {
      const updateData: Record<string, unknown> = {
        id: selectedAgendamento.id_agendamento,
      };

      if (formData.motivo) updateData.motivo = formData.motivo;
      if (formData.status) updateData.status = formData.status;
      if (formData.data) updateData.data = new Date(formData.data);

      await updateMutation.mutateAsync(updateData as any);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: typeof validationErrors = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof typeof validationErrors;
          if (field) {
            errors[field] = error.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedAgendamento) return;
    await deleteMutation.mutateAsync({ id: selectedAgendamento.id_agendamento });
  };

  const openEditDialog = (agendamento: typeof selectedAgendamento) => {
    if (!agendamento) return;
    setSelectedAgendamento(agendamento);
    setFormData({
      id_paciente: agendamento.id_paciente.toString(),
      id_profissional: "",
      motivo: agendamento.motivo ?? "",
      status: agendamento.status,
      data: new Date(agendamento.data).toISOString().slice(0, 16),
      observacoes: "",
      diagnostico: "",
      sintomas: "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (agendamento: typeof selectedAgendamento) => {
    setSelectedAgendamento(agendamento);
    setIsDeleteDialogOpen(true);
  };

  const getPacienteNome = (idPaciente: number) => {
    const paciente = pacientes?.find((p) => p.id_paciente === idPaciente);
    return paciente?.nome ?? `ID: ${idPaciente}`;
  };

  const getProfissionalNome = (idProfissional: number) => {
    const profissional = profissionais?.find(
      (p) => p.id_profissional === idProfissional,
    );
    return profissional?.nome ?? `ID: ${idProfissional}`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Data inválida";
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800",
      confirmado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
      realizado: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getAgendamentosForDate = (day: number) => {
    if (!agendamentos) return [];
    return agendamentos.filter((agendamento) => {
      const agendamentoDate = new Date(agendamento.data);
      return (
        !isNaN(agendamentoDate.getTime()) &&
        agendamentoDate.getDate() === day &&
        agendamentoDate.getMonth() === currentDate.getMonth() &&
        agendamentoDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-border/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayAgendamentos = getAgendamentosForDate(day);
      const today = isToday(day);

      days.push(
        <div
          key={day}
          className={`min-h-[100px] p-2 border border-border/50 ${today ? "bg-primary/5" : "bg-card"}`}
        >
          <div className={`text-sm font-medium mb-1 ${today ? "text-primary" : ""}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayAgendamentos.map((agendamento) => (
              <button
                key={agendamento.id_agendamento}
                onClick={() => openEditDialog(agendamento)}
                className="w-full text-left text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors truncate"
              >
                <div className="font-medium truncate">
                  {(() => {
                    const d = new Date(agendamento.data);
                    return isNaN(d.getTime()) ? "--:--" : d.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  })()}
                </div>
                <div className="text-muted-foreground truncate">
                  {getPacienteNome(agendamento.id_paciente)}
                </div>
                <div className={`text-[10px] px-1 rounded ${getStatusBadge(agendamento.status)}`}>
                  {agendamento.status}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center font-semibold bg-muted border border-border"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos de consultas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Crie um novo agendamento de consulta. A consulta será criada automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-paciente">Paciente</Label>
                <select
                  id="create-paciente"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.id_paciente}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_paciente: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes?.map((pac) => (
                    <option key={pac.id_paciente} value={pac.id_paciente}>
                      {pac.nome} - CPF: {pac.cpf}
                    </option>
                  ))}
                </select>
                {validationErrors.id_paciente && (
                  <p className="text-sm text-red-600">
                    {validationErrors.id_paciente}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-profissional">Profissional</Label>
                <select
                  id="create-profissional"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.id_profissional}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_profissional: e.target.value,
                    })
                  }
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais?.map((prof) => (
                    <option
                      key={prof.id_profissional}
                      value={prof.id_profissional}
                    >
                      {prof.nome} - {prof.especialidade || "Sem especialidade"}
                    </option>
                  ))}
                </select>
                {validationErrors.id_profissional && (
                  <p className="text-sm text-red-600">
                    {validationErrors.id_profissional}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-data">Data e Hora</Label>
                <Input
                  id="create-data"
                  type="datetime-local"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                />
                {validationErrors.data && (
                  <p className="text-sm text-red-600">
                    {validationErrors.data}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <select
                  id="create-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="realizado">Realizado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-motivo">Motivo do Agendamento (opcional)</Label>
                <textarea
                  id="create-motivo"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descreva o motivo do agendamento"
                  value={formData.motivo}
                  onChange={(e) =>
                    setFormData({ ...formData, motivo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-sintomas">Sintomas (opcional)</Label>
                <textarea
                  id="create-sintomas"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descreva os sintomas apresentados"
                  value={formData.sintomas}
                  onChange={(e) =>
                    setFormData({ ...formData, sintomas: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-diagnostico">
                  Diagnóstico (opcional)
                </Label>
                <textarea
                  id="create-diagnostico"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descreva o diagnóstico"
                  value={formData.diagnostico}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnostico: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-observacoes">
                  Observações (opcional)
                </Label>
                <textarea
                  id="create-observacoes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Observações adicionais"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agendamentos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os agendamentos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : agendamentos && agendamentos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendamentos.map((agendamento) => (
                      <TableRow key={agendamento.id_agendamento}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(agendamento.data)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {getPacienteNome(agendamento.id_paciente)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {agendamento.motivo || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(agendamento.status)}`}
                          >
                            {agendamento.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(agendamento)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(agendamento)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento registrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Calendário de Agendamentos</CardTitle>
                  <CardDescription>
                    Visualize os agendamentos no calendário
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-lg font-semibold min-w-[200px] text-center">
                    {currentDate.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                renderCalendar()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-data">Data e Hora</Label>
              <Input
                id="edit-data"
                type="datetime-local"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
              />
              {validationErrors.data && (
                <p className="text-sm text-red-600">{validationErrors.data}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-motivo">Motivo do Agendamento</Label>
              <textarea
                id="edit-motivo"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Descreva o motivo do agendamento"
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedAgendamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento de{" "}
              <strong>
                {selectedAgendamento && formatDate(selectedAgendamento.data)}
              </strong>
              ? Esta ação não pode ser desfeita e também excluirá a consulta associada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedAgendamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
