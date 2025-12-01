"use client";

import { Pencil, Plus, Trash2, User } from "lucide-react";
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

const pacienteSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF deve ter no mínimo 11 caracteres")
    .max(20, "CPF deve ter no máximo 20 caracteres"),
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  telefone: z
    .string()
    .max(50, "Telefone deve ter no máximo 50 caracteres")
    .optional(),
  endereco: z
    .string()
    .max(255, "Endereço deve ter no máximo 255 caracteres")
    .optional(),
  data_nasc: z.date().optional(),
  foto: z
    .string()
    .optional(),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

export function PacientesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<{
    id_paciente: number;
    cpf: string;
    nome: string;
    telefone: string | null;
    endereco: string | null;
    data_nasc: Date | null;
    foto: string | null;
  } | null>(null);

  const [formData, setFormData] = useState<{
    cpf: string;
    nome: string;
    telefone: string;
    endereco: string;
    data_nasc: string;
    foto: string;
  }>({
    cpf: "",
    nome: "",
    telefone: "",
    endereco: "",
    data_nasc: "",
    foto: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [validationErrors, setValidationErrors] = useState<{
    cpf?: string;
    nome?: string;
    telefone?: string;
    endereco?: string;
    data_nasc?: string;
    foto?: string;
  }>({});

  const utils = api.useUtils();

  const { data: pacientes, isLoading } = api.paciente.getAll.useQuery();

  const createMutation = api.paciente.create.useMutation({
    onSuccess: () => {
      utils.paciente.getAll.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.paciente.update.useMutation({
    onSuccess: () => {
      utils.paciente.getAll.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedPaciente(null);
    },
  });

  const deleteMutation = api.paciente.delete.useMutation({
    onSuccess: () => {
      utils.paciente.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedPaciente(null);
    },
  });

  const resetForm = () => {
    setFormData({
      cpf: "",
      nome: "",
      telefone: "",
      endereco: "",
      data_nasc: "",
      foto: "",
    });
    setValidationErrors({});
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem válida");
        return;
      }

      setImageFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, foto: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    setValidationErrors({});
    try {
      const validatedData = pacienteSchema.parse({
        cpf: formData.cpf,
        nome: formData.nome,
        telefone: formData.telefone || undefined,
        endereco: formData.endereco || undefined,
        data_nasc: formData.data_nasc ? new Date(formData.data_nasc) : undefined,
        foto: formData.foto || undefined,
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
    if (!selectedPaciente) return;
    setValidationErrors({});
    try {
      const validatedData = pacienteSchema.parse({
        cpf: formData.cpf,
        nome: formData.nome,
        telefone: formData.telefone || undefined,
        endereco: formData.endereco || undefined,
        data_nasc: formData.data_nasc ? new Date(formData.data_nasc) : undefined,
        foto: formData.foto || undefined,
      });
      await updateMutation.mutateAsync({
        id: selectedPaciente.id_paciente,
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
    if (!selectedPaciente) return;
    await deleteMutation.mutateAsync({ id: selectedPaciente.id_paciente });
  };

  const openEditDialog = (paciente: typeof selectedPaciente) => {
    if (!paciente) return;
    setSelectedPaciente(paciente);
    setFormData({
      cpf: paciente.cpf,
      nome: paciente.nome,
      telefone: paciente.telefone ?? "",
      endereco: paciente.endereco ?? "",
      data_nasc: paciente.data_nasc
        ? new Date(paciente.data_nasc).toISOString().split("T")[0]!
        : "",
      foto: paciente.foto ?? "",
    });
    setImagePreview(paciente.foto ?? "");
    setImageFile(null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (paciente: typeof selectedPaciente) => {
    setSelectedPaciente(paciente);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const calculateAge = (birthDate: Date | null) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacientes cadastrados no sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
              <DialogDescription>
                Adicione um novo paciente ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-nome">Nome Completo</Label>
                  <Input
                    id="create-nome"
                    placeholder="Nome completo do paciente"
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-telefone">Telefone (opcional)</Label>
                  <Input
                    id="create-telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-data-nasc">
                    Data de Nascimento (opcional)
                  </Label>
                  <Input
                    id="create-data-nasc"
                    type="date"
                    value={formData.data_nasc}
                    onChange={(e) =>
                      setFormData({ ...formData, data_nasc: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-endereco">Endereço (opcional)</Label>
                <Input
                  id="create-endereco"
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={formData.endereco}
                  onChange={(e) =>
                    setFormData({ ...formData, endereco: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-foto">Foto (opcional)</Label>
                <Input
                  id="create-foto"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 rounded-lg object-cover border"
                    />
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
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pacientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : pacientes && pacientes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Nasc.</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((paciente) => (
                  <TableRow key={paciente.id_paciente}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {paciente.foto ? (
                          <img
                            src={paciente.foto}
                            alt={paciente.nome}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        {paciente.nome}
                      </div>
                    </TableCell>
                    <TableCell>{paciente.cpf}</TableCell>
                    <TableCell>{paciente.telefone || "-"}</TableCell>
                    <TableCell>{formatDate(paciente.data_nasc)}</TableCell>
                    <TableCell>{calculateAge(paciente.data_nasc)}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {paciente.endereco || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(paciente)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(paciente)}
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
              Nenhum paciente cadastrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome Completo</Label>
                <Input
                  id="edit-nome"
                  placeholder="Nome completo do paciente"
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
                  <p className="text-sm text-red-600">
                    {validationErrors.cpf}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-telefone">Telefone (opcional)</Label>
                <Input
                  id="edit-telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-data-nasc">
                  Data de Nascimento (opcional)
                </Label>
                <Input
                  id="edit-data-nasc"
                  type="date"
                  value={formData.data_nasc}
                  onChange={(e) =>
                    setFormData({ ...formData, data_nasc: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endereco">Endereço (opcional)</Label>
              <Input
                id="edit-endereco"
                placeholder="Rua, número, bairro, cidade - UF"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-foto">Foto (opcional)</Label>
              <Input
                id="edit-foto"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setImagePreview("");
                      setFormData({ ...formData, foto: "" });
                      setImageFile(null);
                    }}
                  >
                    Remover Foto
                  </Button>
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
                setSelectedPaciente(null);
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
              Tem certeza que deseja excluir o paciente{" "}
              <strong>{selectedPaciente?.nome}</strong>? Esta ação não pode ser
              desfeita e também excluirá todos os agendamentos associados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPaciente(null);
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
