"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
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

const profissionalSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF deve ter no mínimo 11 caracteres")
    .max(20, "CPF deve ter no máximo 20 caracteres"),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  especialidade: z
    .string()
    .max(255, "Especialidade deve ter no máximo 255 caracteres")
    .optional(),
  tipo: z
    .string()
    .max(50, "Tipo deve ter no máximo 50 caracteres")
    .optional(),
});

type ProfissionalFormData = z.infer<typeof profissionalSchema>;

export function ProfissionaisPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<{
    id_profissional: number;
    cpf: string;
    nome: string;
    especialidade: string | null;
    tipo: string | null;
  } | null>(null);

  const [formData, setFormData] = useState<ProfissionalFormData>({
    cpf: "",
    nome: "",
    especialidade: "",
    tipo: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    cpf?: string;
    nome?: string;
    especialidade?: string;
    tipo?: string;
  }>({});

  const utils = api.useUtils();

  // Queries
  const { data: profissionais, isLoading } =
    api.profissional.getMyProfissionais.useQuery();

  // Mutations
  const createMutation = api.profissional.create.useMutation({
    onSuccess: () => {
      utils.profissional.getMyProfissionais.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.profissional.update.useMutation({
    onSuccess: () => {
      utils.profissional.getMyProfissionais.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedProfissional(null);
    },
  });

  const deleteMutation = api.profissional.delete.useMutation({
    onSuccess: () => {
      utils.profissional.getMyProfissionais.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedProfissional(null);
    },
  });

  const resetForm = () => {
    setFormData({
      cpf: "",
      nome: "",
      especialidade: "",
      tipo: "",
    });
    setValidationErrors({});
  };

  const handleCreate = async () => {
    setValidationErrors({});
    try {
      const validatedData = profissionalSchema.parse(formData);
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
    if (!selectedProfissional) return;
    setValidationErrors({});
    try {
      const validatedData = profissionalSchema.parse(formData);
      await updateMutation.mutateAsync({
        id: selectedProfissional.id_profissional,
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
    if (!selectedProfissional) return;
    await deleteMutation.mutateAsync({ id: selectedProfissional.id_profissional });
  };

  const openEditDialog = (profissional: typeof selectedProfissional) => {
    if (!profissional) return;
    setSelectedProfissional(profissional);
    setFormData({
      cpf: profissional.cpf,
      nome: profissional.nome,
      especialidade: profissional.especialidade ?? "",
      tipo: profissional.tipo ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (profissional: typeof selectedProfissional) => {
    setSelectedProfissional(profissional);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profissionais de Saúde
          </h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais de saúde cadastrados
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Profissional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Profissional</DialogTitle>
              <DialogDescription>
                Adicione um novo profissional de saúde ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-cpf">CPF</Label>
                <Input
                  id="create-cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: e.target.value })
                  }
                />
                {validationErrors.cpf && (
                  <p className="text-sm text-red-600">
                    {validationErrors.cpf}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-nome">Nome</Label>
                <Input
                  id="create-nome"
                  placeholder="Nome completo"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
                {validationErrors.nome && (
                  <p className="text-sm text-red-600">
                    {validationErrors.nome}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-especialidade">
                  Especialidade (opcional)
                </Label>
                <Input
                  id="create-especialidade"
                  placeholder="Ex: Clínico Geral, Enfermeiro"
                  value={formData.especialidade}
                  onChange={(e) =>
                    setFormData({ ...formData, especialidade: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-tipo">Tipo (opcional)</Label>
                <Input
                  id="create-tipo"
                  placeholder="Ex: Médico, Enfermeiro, Técnico"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os profissionais cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : profissionais && profissionais.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profissionais.map((profissional) => (
                  <TableRow key={profissional.id_profissional}>
                    <TableCell className="font-medium">
                      {profissional.nome}
                    </TableCell>
                    <TableCell>{profissional.cpf}</TableCell>
                    <TableCell>
                      {profissional.especialidade || "-"}
                    </TableCell>
                    <TableCell>{profissional.tipo || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(profissional)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(profissional)}
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
              Nenhum profissional cadastrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Profissional</DialogTitle>
            <DialogDescription>
              Atualize as informações do profissional
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cpf">CPF</Label>
              <Input
                id="edit-cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
              />
              {validationErrors.cpf && (
                <p className="text-sm text-red-600">{validationErrors.cpf}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
              {validationErrors.nome && (
                <p className="text-sm text-red-600">{validationErrors.nome}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-especialidade">
                Especialidade (opcional)
              </Label>
              <Input
                id="edit-especialidade"
                placeholder="Ex: Clínico Geral, Enfermeiro"
                value={formData.especialidade}
                onChange={(e) =>
                  setFormData({ ...formData, especialidade: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo (opcional)</Label>
              <Input
                id="edit-tipo"
                placeholder="Ex: Médico, Enfermeiro, Técnico"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
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
                setSelectedProfissional(null);
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
              Tem certeza que deseja excluir o profissional{" "}
              <strong>{selectedProfissional?.nome}</strong>? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedProfissional(null);
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
