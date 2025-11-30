'use client';
import { Calendar, ChevronLeft, ChevronRight, FileText, List, Pencil, Plus, Trash2 } from "lucide-react";
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
import { PrescricoesPage } from "./prescricoes-page";

const consultaSchema = z.object({
  id_profissional: z.number().positive("Profissional é obrigatório"),
  observacoes: z.string().optional(),
  diagnostico: z.string().optional(),
  sintomas: z.string().optional(),
  data: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
});

const prescricaoSchema = z.object({
  id_consulta: z.number().positive("Consulta é obrigatória"),
  data: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  conteudo: z.string().optional(),
  medicamentos: z.array(z.number()).optional(),
});

type ConsultaFormData = z.infer<typeof consultaSchema>;
type PrescricaoFormData = z.infer<typeof prescricaoSchema>;

export function ConsultasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<{
    id_consulta: number;
    id_profissional: number;
    observacoes: string | null;
    diagnostico: string | null;
    sintomas: string | null;
    data: Date;
  } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState<{
    id_profissional: string;
    observacoes: string;
    diagnostico: string;
    sintomas: string;
    data: string;
  }>({
    id_profissional: "",
    observacoes: "",
    diagnostico: "",
    sintomas: "",
    data: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    id_profissional?: string;
    observacoes?: string;
    diagnostico?: string;
    sintomas?: string;
    data?: string;
  }>({});

  const utils = api.useUtils();

  // Queries
  const { data: consultas, isLoading } = api.consulta.getAll.useQuery();
  const { data: profissionais } =
    api.profissional.getMyProfissionais.useQuery();

  // Mutations
  const createMutation = api.consulta.create.useMutation({
    onSuccess: () => {
      utils.consulta.getAll.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.consulta.update.useMutation({
    onSuccess: () => {
      utils.consulta.getAll.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedConsulta(null);
    },
  });

  const deleteMutation = api.consulta.delete.useMutation({
    onSuccess: () => {
      utils.consulta.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedConsulta(null);
    },
  });

  const resetForm = () => {
    setFormData({
      id_profissional: "",
      observacoes: "",
      diagnostico: "",
      sintomas: "",
      data: "",
    });
    setValidationErrors({});
  };

  const handleCreate = async () => {
    setValidationErrors({});
    try {
      const validatedData = consultaSchema.parse({
        id_profissional: parseInt(formData.id_profissional),
        observacoes: formData.observacoes || undefined,
        diagnostico: formData.diagnostico || undefined,
        sintomas: formData.sintomas || undefined,
        data: new Date(formData.data),
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
    if (!selectedConsulta) return;
    setValidationErrors({});
    try {
      const validatedData = consultaSchema.parse({
        id_profissional: parseInt(formData.id_profissional),
        observacoes: formData.observacoes || undefined,
        diagnostico: formData.diagnostico || undefined,
        sintomas: formData.sintomas || undefined,
        data: new Date(formData.data),
      });
      await updateMutation.mutateAsync({
        id: selectedConsulta.id_consulta,
        ...validatedData,
      });
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
    if (!selectedConsulta) return;
    await deleteMutation.mutateAsync({ id: selectedConsulta.id_consulta });
  };

  const openEditDialog = (consulta: typeof selectedConsulta) => {
    if (!consulta) return;
    setSelectedConsulta(consulta);
    setFormData({
      id_profissional: consulta.id_profissional.toString(),
      observacoes: consulta.observacoes ?? "",
      diagnostico: consulta.diagnostico ?? "",
      sintomas: consulta.sintomas ?? "",
      data: new Date(consulta.data).toISOString().slice(0, 16),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (consulta: typeof selectedConsulta) => {
    setSelectedConsulta(consulta);
    setIsDeleteDialogOpen(true);
  };

  const getProfissionalNome = (idProfissional: number) => {
    const profissional = profissionais?.find(
      (p) => p.id_profissional === idProfissional,
    );
    return profissional?.nome ?? `ID: ${idProfissional}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calendar helpers
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

  const getConsultasForDate = (day: number) => {
    if (!consultas) return [];
    return consultas.filter((consulta) => {
      const consultaDate = new Date(consulta.data);
      return (
        consultaDate.getDate() === day &&
        consultaDate.getMonth() === currentDate.getMonth() &&
        consultaDate.getFullYear() === currentDate.getFullYear()
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

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-border/50" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayConsultas = getConsultasForDate(day);
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
            {dayConsultas.map((consulta) => (
              <button
                key={consulta.id_consulta}
                onClick={() => openEditDialog(consulta)}
                className="w-full text-left text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors truncate"
              >
                <div className="font-medium truncate">
                  {new Date(consulta.data).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-muted-foreground truncate">
                  {getProfissionalNome(consulta.id_profissional)}
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
          <h1 className="text-3xl font-bold tracking-tight">Consultas</h1>
          <p className="text-muted-foreground">
            Gerencie as consultas médicas realizadas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Consulta</DialogTitle>
              <DialogDescription>
                Registre uma nova consulta médica no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                <Label htmlFor="create-sintomas">Sintomas (opcional)</Label>
                <textarea
                  id="create-sintomas"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                {createMutation.isPending ? "Criando..." : "Criar"}
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
          <TabsTrigger value="prescricoes" className="gap-2">
            <FileText className="h-4 w-4" />
            Prescrições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Consultas</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as consultas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : consultas && consultas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Sintomas</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultas.map((consulta) => (
                      <TableRow key={consulta.id_consulta}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(consulta.data)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getProfissionalNome(consulta.id_profissional)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {consulta.sintomas || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {consulta.diagnostico || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(consulta)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(consulta)}
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
                  Nenhuma consulta registrada
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
                  <CardTitle>Calendário de Consultas</CardTitle>
                  <CardDescription>
                    Visualize as consultas agendadas no calendário
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

        <TabsContent value="prescricoes" className="space-y-4">
          <PrescricoesPage />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
            <DialogDescription>
              Atualize as informações da consulta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-profissional">Profissional</Label>
              <select
                id="edit-profissional"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.id_profissional}
                onChange={(e) =>
                  setFormData({ ...formData, id_profissional: e.target.value })
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
              <Label htmlFor="edit-sintomas">Sintomas (opcional)</Label>
              <textarea
                id="edit-sintomas"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Descreva os sintomas apresentados"
                value={formData.sintomas}
                onChange={(e) =>
                  setFormData({ ...formData, sintomas: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-diagnostico">Diagnóstico (opcional)</Label>
              <textarea
                id="edit-diagnostico"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Descreva o diagnóstico"
                value={formData.diagnostico}
                onChange={(e) =>
                  setFormData({ ...formData, diagnostico: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações (opcional)</Label>
              <textarea
                id="edit-observacoes"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedConsulta(null);
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
              Tem certeza que deseja excluir esta consulta de{" "}
              <strong>
                {selectedConsulta && formatDate(selectedConsulta.data)}
              </strong>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedConsulta(null);
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
