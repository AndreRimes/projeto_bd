"use client";

import { Package, Pencil, Pill, Plus, Trash2 } from "lucide-react";
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

const medicamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

const estoqueMedicamentosSchema = z.object({
  id_medicamento: z.number().positive("Medicamento é obrigatório"),
  quantidade_atual: z.number().min(0).optional(),
  quantidade_minima: z.number().min(0).optional(),
  data_validade: z.date().optional(),
});

export function MedicamentosPage() {
  const [isCreateMedicamentoOpen, setIsCreateMedicamentoOpen] = useState(false);
  const [isEditMedicamentoOpen, setIsEditMedicamentoOpen] = useState(false);
  const [isDeleteMedicamentoOpen, setIsDeleteMedicamentoOpen] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<any>(null);
  const [medicamentoFormData, setMedicamentoFormData] = useState({
    nome: "",
  });
  const [medicamentoErrors, setMedicamentoErrors] = useState<any>({});

  const [isCreateEstoqueOpen, setIsCreateEstoqueOpen] = useState(false);
  const [isEditEstoqueOpen, setIsEditEstoqueOpen] = useState(false);
  const [isDeleteEstoqueOpen, setIsDeleteEstoqueOpen] = useState(false);
  const [selectedEstoque, setSelectedEstoque] = useState<any>(null);
  const [estoqueFormData, setEstoqueFormData] = useState({
    id_medicamento: "",
    quantidade_atual: "0",
    quantidade_minima: "0",
    data_validade: "",
  });
  const [estoqueErrors, setEstoqueErrors] = useState<any>({});

  const utils = api.useUtils();

  const { data: medicamentos, isLoading: loadingMedicamentos } =
    api.medicamento.getAll.useQuery();
  const { data: estoques, isLoading: loadingEstoques } =
    api.estoqueMedicamentos.getAll.useQuery();

  const createMedicamentoMutation = api.medicamento.create.useMutation({
    onSuccess: () => {
      utils.medicamento.getAll.invalidate();
      setIsCreateMedicamentoOpen(false);
      resetMedicamentoForm();
    },
  });

  const updateMedicamentoMutation = api.medicamento.update.useMutation({
    onSuccess: () => {
      utils.medicamento.getAll.invalidate();
      setIsEditMedicamentoOpen(false);
      resetMedicamentoForm();
      setSelectedMedicamento(null);
    },
  });

  const deleteMedicamentoMutation = api.medicamento.delete.useMutation({
    onSuccess: () => {
      utils.medicamento.getAll.invalidate();
      setIsDeleteMedicamentoOpen(false);
      setSelectedMedicamento(null);
    },
  });

  const createEstoqueMutation = api.estoqueMedicamentos.create.useMutation({
    onSuccess: () => {
      utils.estoqueMedicamentos.getAll.invalidate();
      setIsCreateEstoqueOpen(false);
      resetEstoqueForm();
    },
  });

  const updateEstoqueMutation = api.estoqueMedicamentos.update.useMutation({
    onSuccess: () => {
      utils.estoqueMedicamentos.getAll.invalidate();
      setIsEditEstoqueOpen(false);
      resetEstoqueForm();
      setSelectedEstoque(null);
    },
  });

  const deleteEstoqueMutation = api.estoqueMedicamentos.delete.useMutation({
    onSuccess: () => {
      utils.estoqueMedicamentos.getAll.invalidate();
      setIsDeleteEstoqueOpen(false);
      setSelectedEstoque(null);
    },
  });

  const resetMedicamentoForm = () => {
    setMedicamentoFormData({
      nome: "",
    });
    setMedicamentoErrors({});
  };

  const resetEstoqueForm = () => {
    setEstoqueFormData({
      id_medicamento: "",
      quantidade_atual: "0",
      quantidade_minima: "0",
      data_validade: "",
    });
    setEstoqueErrors({});
  };

  const handleCreateMedicamento = async () => {
    setMedicamentoErrors({});
    try {
      const validatedData = medicamentoSchema.parse({
        nome: medicamentoFormData.nome,
      });
      await createMedicamentoMutation.mutateAsync(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setMedicamentoErrors(errors);
      }
    }
  };

  const handleEditMedicamento = async () => {
    if (!selectedMedicamento) return;
    setMedicamentoErrors({});
    try {
      const validatedData = medicamentoSchema.parse({
        nome: medicamentoFormData.nome,
      });
      await updateMedicamentoMutation.mutateAsync({
        id: selectedMedicamento.id_medicamento,
        ...validatedData,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setMedicamentoErrors(errors);
      }
    }
  };

  const handleCreateEstoque = async () => {
    setEstoqueErrors({});
    try {
      const validatedData = estoqueMedicamentosSchema.parse({
        id_medicamento: parseInt(estoqueFormData.id_medicamento),
        quantidade_atual: parseInt(estoqueFormData.quantidade_atual),
        quantidade_minima: parseInt(estoqueFormData.quantidade_minima),
        data_validade: estoqueFormData.data_validade
          ? new Date(estoqueFormData.data_validade)
          : undefined,
      });
      await createEstoqueMutation.mutateAsync(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setEstoqueErrors(errors);
      }
    }
  };

  const handleEditEstoque = async () => {
    if (!selectedEstoque) return;
    setEstoqueErrors({});
    try {
      const validatedData = estoqueMedicamentosSchema.parse({
        id_medicamento: parseInt(estoqueFormData.id_medicamento),
        quantidade_atual: parseInt(estoqueFormData.quantidade_atual),
        quantidade_minima: parseInt(estoqueFormData.quantidade_minima),
        data_validade: estoqueFormData.data_validade
          ? new Date(estoqueFormData.data_validade)
          : undefined,
      });
      await updateEstoqueMutation.mutateAsync({
        id: selectedEstoque.id_estoque,
        ...validatedData,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setEstoqueErrors(errors);
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getMedicamentoNome = (id: number) => {
    return (
      medicamentos?.find((m) => m.id_medicamento === id)?.nome ?? `ID: ${id}`
    );
  };

  const getEstoqueStatus = (estoque: any) => {
    if (estoque.quantidade_atual <= 0) {
      return { text: "Sem estoque", color: "bg-red-100 text-red-800" };
    } else if (estoque.quantidade_atual <= estoque.quantidade_minima) {
      return { text: "Estoque baixo", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Disponível", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medicamentos</h1>
        <p className="text-muted-foreground">
          Gerencie medicamentos e estoques
        </p>
      </div>

      <Tabs defaultValue="medicamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="medicamentos" className="gap-2">
            <Pill className="h-4 w-4" />
            Medicamentos
          </TabsTrigger>
          <TabsTrigger value="estoques" className="gap-2">
            <Package className="h-4 w-4" />
            Estoques
          </TabsTrigger>
        </TabsList>

        {/* TAB MEDICAMENTOS */}
        <TabsContent value="medicamentos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isCreateMedicamentoOpen}
              onOpenChange={setIsCreateMedicamentoOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetMedicamentoForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Medicamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Medicamento</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo medicamento no sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-medicamento-nome">Nome</Label>
                    <Input
                      id="create-medicamento-nome"
                      placeholder="Ex: Dipirona, Paracetamol"
                      value={medicamentoFormData.nome}
                      onChange={(e) =>
                        setMedicamentoFormData({
                          ...medicamentoFormData,
                          nome: e.target.value,
                        })
                      }
                    />
                    {medicamentoErrors.nome && (
                      <p className="text-sm text-red-600">
                        {medicamentoErrors.nome}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateMedicamentoOpen(false);
                      resetMedicamentoForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateMedicamento}
                    disabled={createMedicamentoMutation.isPending}
                  >
                    {createMedicamentoMutation.isPending ? "Criando..." : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Medicamentos</CardTitle>
              <CardDescription>
                Todos os medicamentos cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMedicamentos ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : medicamentos && medicamentos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicamentos.map((medicamento) => (
                      <TableRow key={medicamento.id_medicamento}>
                        <TableCell className="font-medium">
                          #{medicamento.id_medicamento}
                        </TableCell>
                        <TableCell>{medicamento.nome}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedMedicamento(medicamento);
                                setMedicamentoFormData({
                                  nome: medicamento.nome,
                                });
                                setIsEditMedicamentoOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedMedicamento(medicamento);
                                setIsDeleteMedicamentoOpen(true);
                              }}
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
                  Nenhum medicamento cadastrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB ESTOQUES */}
        <TabsContent value="estoques" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isCreateEstoqueOpen}
              onOpenChange={setIsCreateEstoqueOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetEstoqueForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Estoque
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Estoque de Medicamento</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo estoque de medicamentos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-estoque-medicamento">
                      Medicamento
                    </Label>
                    <select
                      id="create-estoque-medicamento"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={estoqueFormData.id_medicamento}
                      onChange={(e) =>
                        setEstoqueFormData({
                          ...estoqueFormData,
                          id_medicamento: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione um medicamento</option>
                      {medicamentos?.map((med) => (
                        <option
                          key={med.id_medicamento}
                          value={med.id_medicamento}
                        >
                          {med.nome}
                        </option>
                      ))}
                    </select>
                    {estoqueErrors.id_medicamento && (
                      <p className="text-sm text-red-600">
                        {estoqueErrors.id_medicamento}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-estoque-min">Qtd. Mínima</Label>
                      <Input
                        id="create-estoque-min"
                        type="number"
                        min="0"
                        value={estoqueFormData.quantidade_minima}
                        onChange={(e) =>
                          setEstoqueFormData({
                            ...estoqueFormData,
                            quantidade_minima: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-estoque-atual">Qtd. Atual</Label>
                      <Input
                        id="create-estoque-atual"
                        type="number"
                        min="0"
                        value={estoqueFormData.quantidade_atual}
                        onChange={(e) =>
                          setEstoqueFormData({
                            ...estoqueFormData,
                            quantidade_atual: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-estoque-validade">
                      Data de Validade (opcional)
                    </Label>
                    <Input
                      id="create-estoque-validade"
                      type="date"
                      value={estoqueFormData.data_validade}
                      onChange={(e) =>
                        setEstoqueFormData({
                          ...estoqueFormData,
                          data_validade: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateEstoqueOpen(false);
                      resetEstoqueForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateEstoque}
                    disabled={createEstoqueMutation.isPending}
                  >
                    {createEstoqueMutation.isPending ? "Criando..." : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estoques de Medicamentos</CardTitle>
              <CardDescription>
                Controle de estoque de medicamentos por posto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEstoques ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : estoques && estoques.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Qtd. Mínima</TableHead>
                      <TableHead>Qtd. Atual</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoques.map((estoque) => {
                      const status = getEstoqueStatus(estoque);
                      return (
                        <TableRow key={estoque.id_estoque}>
                          <TableCell className="font-medium">
                            #{estoque.id_estoque}
                          </TableCell>
                          <TableCell>
                            {getMedicamentoNome(estoque.id_medicamento)}
                          </TableCell>
                          <TableCell>{estoque.quantidade_minima}</TableCell>
                          <TableCell>{estoque.quantidade_atual}</TableCell>
                          <TableCell>
                            {formatDate(estoque.data_validade)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedEstoque(estoque);
                                  setEstoqueFormData({
                                    id_medicamento:
                                      estoque.id_medicamento.toString(),
                                    quantidade_minima:
                                      estoque.quantidade_minima.toString(),
                                    quantidade_atual:
                                      estoque.quantidade_atual.toString(),
                                    data_validade: estoque.data_validade
                                      ? new Date(estoque.data_validade)
                                          .toISOString()
                                          .split("T")[0]!
                                      : "",
                                  });
                                  setIsEditEstoqueOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedEstoque(estoque);
                                  setIsDeleteEstoqueOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum estoque cadastrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOGS DE EDIÇÃO E EXCLUSÃO - MEDICAMENTOS */}
      <Dialog
        open={isEditMedicamentoOpen}
        onOpenChange={setIsEditMedicamentoOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Medicamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do medicamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-medicamento-nome">Nome</Label>
              <Input
                id="edit-medicamento-nome"
                value={medicamentoFormData.nome}
                onChange={(e) =>
                  setMedicamentoFormData({
                    ...medicamentoFormData,
                    nome: e.target.value,
                  })
                }
              />
              {medicamentoErrors.nome && (
                <p className="text-sm text-red-600">
                  {medicamentoErrors.nome}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditMedicamentoOpen(false);
                resetMedicamentoForm();
                setSelectedMedicamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditMedicamento}
              disabled={updateMedicamentoMutation.isPending}
            >
              {updateMedicamentoMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteMedicamentoOpen}
        onOpenChange={setIsDeleteMedicamentoOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o medicamento{" "}
              <strong>{selectedMedicamento?.nome}</strong>? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteMedicamentoOpen(false);
                setSelectedMedicamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteMedicamentoMutation.mutate({
                  id: selectedMedicamento.id_medicamento,
                })
              }
              disabled={deleteMedicamentoMutation.isPending}
            >
              {deleteMedicamentoMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGS DE EDIÇÃO E EXCLUSÃO - ESTOQUES */}
      <Dialog open={isEditEstoqueOpen} onOpenChange={setIsEditEstoqueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estoque</DialogTitle>
            <DialogDescription>
              Atualize as informações do estoque
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-estoque-medicamento">Medicamento</Label>
              <select
                id="edit-estoque-medicamento"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={estoqueFormData.id_medicamento}
                onChange={(e) =>
                  setEstoqueFormData({
                    ...estoqueFormData,
                    id_medicamento: e.target.value,
                  })
                }
              >
                <option value="">Selecione um medicamento</option>
                {medicamentos?.map((med) => (
                  <option key={med.id_medicamento} value={med.id_medicamento}>
                    {med.nome}
                  </option>
                ))}
              </select>
              {estoqueErrors.id_medicamento && (
                <p className="text-sm text-red-600">
                  {estoqueErrors.id_medicamento}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-estoque-min">Qtd. Mínima</Label>
                <Input
                  id="edit-estoque-min"
                  type="number"
                  min="0"
                  value={estoqueFormData.quantidade_minima}
                  onChange={(e) =>
                    setEstoqueFormData({
                      ...estoqueFormData,
                      quantidade_minima: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-estoque-atual">Qtd. Atual</Label>
                <Input
                  id="edit-estoque-atual"
                  type="number"
                  min="0"
                  value={estoqueFormData.quantidade_atual}
                  onChange={(e) =>
                    setEstoqueFormData({
                      ...estoqueFormData,
                      quantidade_atual: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estoque-validade">Data de Validade</Label>
              <Input
                id="edit-estoque-validade"
                type="date"
                value={estoqueFormData.data_validade}
                onChange={(e) =>
                  setEstoqueFormData({
                    ...estoqueFormData,
                    data_validade: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditEstoqueOpen(false);
                resetEstoqueForm();
                setSelectedEstoque(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditEstoque}
              disabled={updateEstoqueMutation.isPending}
            >
              {updateEstoqueMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteEstoqueOpen} onOpenChange={setIsDeleteEstoqueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o estoque{" "}
              <strong>#{selectedEstoque?.id_estoque}</strong>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteEstoqueOpen(false);
                setSelectedEstoque(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteEstoqueMutation.mutate({
                  id: selectedEstoque.id_estoque,
                })
              }
              disabled={deleteEstoqueMutation.isPending}
            >
              {deleteEstoqueMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
