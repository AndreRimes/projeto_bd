"use client";

import { FileText, Pencil, Pill, Plus, Trash2, X } from "lucide-react";
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
import { api } from "~/trpc/react";

const prescricaoSchema = z.object({
  id_consulta: z.number().positive("Consulta é obrigatória"),
  data: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  conteudo: z.string().optional(),
  medicamentos: z.array(z.number()).optional(),
});

type PrescricaoFormData = z.infer<typeof prescricaoSchema>;

export function PrescricoesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrescricao, setSelectedPrescricao] = useState<{
    id_prescricao: number;
    id_consulta: number;
    data: Date;
    conteudo: string | null;
  } | null>(null);

  const [formData, setFormData] = useState<{
    id_consulta: string;
    data: string;
    conteudo: string;
    medicamentos: number[];
  }>({
    id_consulta: "",
    data: "",
    conteudo: "",
    medicamentos: [],
  });

  const [validationErrors, setValidationErrors] = useState<{
    id_consulta?: string;
    data?: string;
    conteudo?: string;
    medicamentos?: string;
  }>({});

  const utils = api.useUtils();

  const { data: prescricoes, isLoading } = api.prescricao.getAll.useQuery();
  const { data: consultas } = api.consulta.getAll.useQuery();
  const { data: medicamentos } = api.medicamento.getAll.useQuery();

  const createMutation = api.prescricao.create.useMutation({
    onSuccess: () => {
      utils.prescricao.getAll.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.prescricao.update.useMutation({
    onSuccess: () => {
      utils.prescricao.getAll.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedPrescricao(null);
    },
  });

  const deleteMutation = api.prescricao.delete.useMutation({
    onSuccess: () => {
      utils.prescricao.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedPrescricao(null);
    },
  });

  const resetForm = () => {
    setFormData({
      id_consulta: "",
      data: "",
      conteudo: "",
      medicamentos: [],
    });
    setValidationErrors({});
  };

  const handleCreate = async () => {
    setValidationErrors({});
    try {
      const validatedData = prescricaoSchema.parse({
        id_consulta: parseInt(formData.id_consulta),
        data: new Date(formData.data),
        conteudo: formData.conteudo || undefined,
        medicamentos: formData.medicamentos.length > 0 ? formData.medicamentos : undefined,
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
    if (!selectedPrescricao) return;
    setValidationErrors({});
    try {
      const validatedData = prescricaoSchema.parse({
        id_consulta: parseInt(formData.id_consulta),
        data: new Date(formData.data),
        conteudo: formData.conteudo || undefined,
        medicamentos: formData.medicamentos.length > 0 ? formData.medicamentos : undefined,
      });
      await updateMutation.mutateAsync({
        id: selectedPrescricao.id_prescricao,
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
    if (!selectedPrescricao) return;
    await deleteMutation.mutateAsync({ id: selectedPrescricao.id_prescricao });
  };

  const openEditDialog = async (prescricao: typeof selectedPrescricao) => {
    if (!prescricao) return;
    setSelectedPrescricao(prescricao);

    const meds = await utils.prescricao.getMedicamentos.fetch({
      id_prescricao: prescricao.id_prescricao,
    });

    setFormData({
      id_consulta: prescricao.id_consulta.toString(),
      data: new Date(prescricao.data).toISOString().slice(0, 16),
      conteudo: prescricao.conteudo ?? "",
      medicamentos: meds.map((m) => m.id_medicamento),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (prescricao: typeof selectedPrescricao) => {
    setSelectedPrescricao(prescricao);
    setIsDeleteDialogOpen(true);
  };

  const getConsultaInfo = (idConsulta: number) => {
    const consulta = consultas?.find((c) => c.id_consulta === idConsulta);
    if (!consulta) return `ID: ${idConsulta}`;
    return `Consulta ${new Date(consulta.data).toLocaleDateString("pt-BR")}`;
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

  const toggleMedicamento = (idMedicamento: number) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.includes(idMedicamento)
        ? prev.medicamentos.filter((id) => id !== idMedicamento)
        : [...prev.medicamentos, idMedicamento],
    }));
  };

  const getMedicamentoNome = (idMedicamento: number) => {
    return medicamentos?.find((m) => m.id_medicamento === idMedicamento)?.nome ?? "Desconhecido";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescrições</h1>
          <p className="text-muted-foreground">
            Gerencie as prescrições médicas e medicamentos prescritos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Prescrição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Prescrição</DialogTitle>
              <DialogDescription>
                Crie uma nova prescrição médica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-consulta">Consulta</Label>
                <select
                  id="create-consulta"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.id_consulta}
                  onChange={(e) =>
                    setFormData({ ...formData, id_consulta: e.target.value })
                  }
                >
                  <option value="">Selecione uma consulta</option>
                  {consultas?.map((consulta) => (
                    <option
                      key={consulta.id_consulta}
                      value={consulta.id_consulta}
                    >
                      {formatDate(consulta.data)} - {consulta.diagnostico || "Sem diagnóstico"}
                    </option>
                  ))}
                </select>
                {validationErrors.id_consulta && (
                  <p className="text-sm text-red-600">
                    {validationErrors.id_consulta}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-data">Data da Prescrição</Label>
                <Input
                  id="create-data"
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
                <Label htmlFor="create-conteudo">Conteúdo (opcional)</Label>
                <textarea
                  id="create-conteudo"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Instruções, posologia, etc."
                  value={formData.conteudo}
                  onChange={(e) =>
                    setFormData({ ...formData, conteudo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Medicamentos (opcional)</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {medicamentos && medicamentos.length > 0 ? (
                    medicamentos.map((med) => (
                      <div
                        key={med.id_medicamento}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`med-create-${med.id_medicamento}`}
                          checked={formData.medicamentos.includes(
                            med.id_medicamento,
                          )}
                          onChange={() => toggleMedicamento(med.id_medicamento)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                          htmlFor={`med-create-${med.id_medicamento}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {med.nome}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum medicamento cadastrado
                    </p>
                  )}
                </div>
                {formData.medicamentos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.medicamentos.map((idMed) => (
                      <div
                        key={idMed}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        <Pill className="h-3 w-3" />
                        {getMedicamentoNome(idMed)}
                        <button
                          onClick={() => toggleMedicamento(idMed)}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Prescrições</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as prescrições médicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : prescricoes && prescricoes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Consulta</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescricoes.map((prescricao) => (
                  <TableRow key={prescricao.id_prescricao}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {formatDate(prescricao.data)}
                      </div>
                    </TableCell>
                    <TableCell>{getConsultaInfo(prescricao.id_consulta)}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">
                        {prescricao.conteudo || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => void openEditDialog(prescricao)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(prescricao)}
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
              Nenhuma prescrição registrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Prescrição</DialogTitle>
            <DialogDescription>
              Atualize as informações da prescrição
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-consulta">Consulta</Label>
              <select
                id="edit-consulta"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.id_consulta}
                onChange={(e) =>
                  setFormData({ ...formData, id_consulta: e.target.value })
                }
              >
                <option value="">Selecione uma consulta</option>
                {consultas?.map((consulta) => (
                  <option
                    key={consulta.id_consulta}
                    value={consulta.id_consulta}
                  >
                    {formatDate(consulta.data)} - {consulta.diagnostico || "Sem diagnóstico"}
                  </option>
                ))}
              </select>
              {validationErrors.id_consulta && (
                <p className="text-sm text-red-600">
                  {validationErrors.id_consulta}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-data">Data da Prescrição</Label>
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
              <Label htmlFor="edit-conteudo">Conteúdo (opcional)</Label>
              <textarea
                id="edit-conteudo"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Instruções, posologia, etc."
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Medicamentos (opcional)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {medicamentos && medicamentos.length > 0 ? (
                  medicamentos.map((med) => (
                    <div
                      key={med.id_medicamento}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`med-edit-${med.id_medicamento}`}
                        checked={formData.medicamentos.includes(
                          med.id_medicamento,
                        )}
                        onChange={() => toggleMedicamento(med.id_medicamento)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`med-edit-${med.id_medicamento}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {med.nome}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum medicamento cadastrado
                  </p>
                )}
              </div>
              {formData.medicamentos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.medicamentos.map((idMed) => (
                    <div
                      key={idMed}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      <Pill className="h-3 w-3" />
                      {getMedicamentoNome(idMed)}
                      <button
                        onClick={() => toggleMedicamento(idMed)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedPrescricao(null);
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
              Tem certeza que deseja excluir esta prescrição de{" "}
              <strong>
                {selectedPrescricao && formatDate(selectedPrescricao.data)}
              </strong>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPrescricao(null);
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
