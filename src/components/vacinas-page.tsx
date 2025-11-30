"use client";

import {
    Calendar,
    Package,
    Pencil,
    Plus,
    Syringe,
    Trash2,
    User,
} from "lucide-react";
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

// Schemas
const vacinaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  fabricante: z.string().optional(),
  doses_necessarias: z.number().min(1).optional(),
});

const estoqueVacinaSchema = z.object({
  id_vacina: z.number().positive("Vacina é obrigatória"),
  quantidade_minima: z.number().min(0).optional(),
  quantidade_disponivel: z.number().min(0).optional(),
  data_validade: z.date().optional(),
});

const aplicacaoVacinaSchema = z.object({
  id_paciente: z.number().positive("Paciente é obrigatório"),
  id_vacina: z.number().positive("Vacina é obrigatória"),
  id_profissional: z.number().positive("Profissional é obrigatório"),
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  numero_dose: z.number().min(1, "Número da dose deve ser no mínimo 1"),
});

export function VacinasPage() {
  // Estados para Vacinas
  const [isCreateVacinaOpen, setIsCreateVacinaOpen] = useState(false);
  const [isEditVacinaOpen, setIsEditVacinaOpen] = useState(false);
  const [isDeleteVacinaOpen, setIsDeleteVacinaOpen] = useState(false);
  const [selectedVacina, setSelectedVacina] = useState<any>(null);
  const [vacinaFormData, setVacinaFormData] = useState({
    nome: "",
    fabricante: "",
    doses_necessarias: "1",
  });
  const [vacinaErrors, setVacinaErrors] = useState<any>({});

  // Estados para Estoque
  const [isCreateEstoqueOpen, setIsCreateEstoqueOpen] = useState(false);
  const [isEditEstoqueOpen, setIsEditEstoqueOpen] = useState(false);
  const [isDeleteEstoqueOpen, setIsDeleteEstoqueOpen] = useState(false);
  const [selectedEstoque, setSelectedEstoque] = useState<any>(null);
  const [estoqueFormData, setEstoqueFormData] = useState({
    id_vacina: "",
    quantidade_minima: "0",
    quantidade_disponivel: "0",
    data_validade: "",
  });
  const [estoqueErrors, setEstoqueErrors] = useState<any>({});

  // Estados para Aplicação
  const [isCreateAplicacaoOpen, setIsCreateAplicacaoOpen] = useState(false);
  const [isEditAplicacaoOpen, setIsEditAplicacaoOpen] = useState(false);
  const [isDeleteAplicacaoOpen, setIsDeleteAplicacaoOpen] = useState(false);
  const [selectedAplicacao, setSelectedAplicacao] = useState<any>(null);
  const [aplicacaoFormData, setAplicacaoFormData] = useState({
    id_paciente: "",
    id_vacina: "",
    id_profissional: "",
    data: "",
    numero_dose: "1",
  });
  const [aplicacaoErrors, setAplicacaoErrors] = useState<any>({});

  const utils = api.useUtils();

  // Queries
  const { data: vacinas, isLoading: loadingVacinas } =
    api.vacina.getAll.useQuery();
  const { data: estoques, isLoading: loadingEstoques } =
    api.estoqueVacina.getAll.useQuery();
  const { data: aplicacoes, isLoading: loadingAplicacoes } =
    api.aplicacaoVacina.getAll.useQuery();
  const { data: pacientes } = api.paciente.getAll.useQuery();
  const { data: profissionais } = api.profissional.getMyProfissionais.useQuery();

  // Mutations - Vacinas
  const createVacinaMutation = api.vacina.create.useMutation({
    onSuccess: () => {
      utils.vacina.getAll.invalidate();
      setIsCreateVacinaOpen(false);
      resetVacinaForm();
    },
  });

  const updateVacinaMutation = api.vacina.update.useMutation({
    onSuccess: () => {
      utils.vacina.getAll.invalidate();
      setIsEditVacinaOpen(false);
      resetVacinaForm();
      setSelectedVacina(null);
    },
  });

  const deleteVacinaMutation = api.vacina.delete.useMutation({
    onSuccess: () => {
      utils.vacina.getAll.invalidate();
      setIsDeleteVacinaOpen(false);
      setSelectedVacina(null);
    },
  });

  // Mutations - Estoque
  const createEstoqueMutation = api.estoqueVacina.create.useMutation({
    onSuccess: () => {
      utils.estoqueVacina.getAll.invalidate();
      setIsCreateEstoqueOpen(false);
      resetEstoqueForm();
    },
  });

  const updateEstoqueMutation = api.estoqueVacina.update.useMutation({
    onSuccess: () => {
      utils.estoqueVacina.getAll.invalidate();
      setIsEditEstoqueOpen(false);
      resetEstoqueForm();
      setSelectedEstoque(null);
    },
  });

  const deleteEstoqueMutation = api.estoqueVacina.delete.useMutation({
    onSuccess: () => {
      utils.estoqueVacina.getAll.invalidate();
      setIsDeleteEstoqueOpen(false);
      setSelectedEstoque(null);
    },
  });

  // Mutations - Aplicação
  const createAplicacaoMutation = api.aplicacaoVacina.create.useMutation({
    onSuccess: () => {
      utils.aplicacaoVacina.getAll.invalidate();
      setIsCreateAplicacaoOpen(false);
      resetAplicacaoForm();
    },
  });

  const updateAplicacaoMutation = api.aplicacaoVacina.update.useMutation({
    onSuccess: () => {
      utils.aplicacaoVacina.getAll.invalidate();
      setIsEditAplicacaoOpen(false);
      resetAplicacaoForm();
      setSelectedAplicacao(null);
    },
  });

  const deleteAplicacaoMutation = api.aplicacaoVacina.delete.useMutation({
    onSuccess: () => {
      utils.aplicacaoVacina.getAll.invalidate();
      setIsDeleteAplicacaoOpen(false);
      setSelectedAplicacao(null);
    },
  });

  // Reset Forms
  const resetVacinaForm = () => {
    setVacinaFormData({
      nome: "",
      fabricante: "",
      doses_necessarias: "1",
    });
    setVacinaErrors({});
  };

  const resetEstoqueForm = () => {
    setEstoqueFormData({
      id_vacina: "",
      quantidade_minima: "0",
      quantidade_disponivel: "0",
      data_validade: "",
    });
    setEstoqueErrors({});
  };

  const resetAplicacaoForm = () => {
    setAplicacaoFormData({
      id_paciente: "",
      id_vacina: "",
      id_profissional: "",
      data: "",
      numero_dose: "1",
    });
    setAplicacaoErrors({});
  };

  // Handlers - Vacinas
  const handleCreateVacina = async () => {
    setVacinaErrors({});
    try {
      const validatedData = vacinaSchema.parse({
        nome: vacinaFormData.nome,
        fabricante: vacinaFormData.fabricante || undefined,
        doses_necessarias: parseInt(vacinaFormData.doses_necessarias),
      });
      await createVacinaMutation.mutateAsync(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setVacinaErrors(errors);
      }
    }
  };

  const handleEditVacina = async () => {
    if (!selectedVacina) return;
    setVacinaErrors({});
    try {
      const validatedData = vacinaSchema.parse({
        nome: vacinaFormData.nome,
        fabricante: vacinaFormData.fabricante || undefined,
        doses_necessarias: parseInt(vacinaFormData.doses_necessarias),
      });
      await updateVacinaMutation.mutateAsync({
        id: selectedVacina.id_vacina,
        ...validatedData,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setVacinaErrors(errors);
      }
    }
  };

  // Handlers - Estoque
  const handleCreateEstoque = async () => {
    setEstoqueErrors({});
    try {
      const validatedData = estoqueVacinaSchema.parse({
        id_vacina: parseInt(estoqueFormData.id_vacina),
        quantidade_minima: parseInt(estoqueFormData.quantidade_minima),
        quantidade_disponivel: parseInt(estoqueFormData.quantidade_disponivel),
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
      const validatedData = estoqueVacinaSchema.parse({
        id_vacina: parseInt(estoqueFormData.id_vacina),
        quantidade_minima: parseInt(estoqueFormData.quantidade_minima),
        quantidade_disponivel: parseInt(estoqueFormData.quantidade_disponivel),
        data_validade: estoqueFormData.data_validade
          ? new Date(estoqueFormData.data_validade)
          : undefined,
      });
      await updateEstoqueMutation.mutateAsync({
        id: selectedEstoque.id_estoque_vacina,
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

  // Handlers - Aplicação
  const handleCreateAplicacao = async () => {
    setAplicacaoErrors({});
    try {
      const validatedData = aplicacaoVacinaSchema.parse({
        id_paciente: parseInt(aplicacaoFormData.id_paciente),
        id_vacina: parseInt(aplicacaoFormData.id_vacina),
        id_profissional: parseInt(aplicacaoFormData.id_profissional),
        data: new Date(aplicacaoFormData.data),
        numero_dose: parseInt(aplicacaoFormData.numero_dose),
      });
      await createAplicacaoMutation.mutateAsync(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setAplicacaoErrors(errors);
      }
    }
  };

  const handleEditAplicacao = async () => {
    if (!selectedAplicacao) return;
    setAplicacaoErrors({});
    try {
      const validatedData = aplicacaoVacinaSchema.parse({
        id_paciente: parseInt(aplicacaoFormData.id_paciente),
        id_vacina: parseInt(aplicacaoFormData.id_vacina),
        id_profissional: parseInt(aplicacaoFormData.id_profissional),
        data: new Date(aplicacaoFormData.data),
        numero_dose: parseInt(aplicacaoFormData.numero_dose),
      });
      await updateAplicacaoMutation.mutateAsync({
        id: selectedAplicacao.id_aplicacao,
        ...validatedData,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: any = {};
        err.errors.forEach((error) => {
          const field = error.path[0];
          if (field) errors[field] = error.message;
        });
        setAplicacaoErrors(errors);
      }
    }
  };

  // Helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPacienteNome = (id: number) => {
    return pacientes?.find((p) => p.id_paciente === id)?.nome ?? `ID: ${id}`;
  };

  const getProfissionalNome = (id: number) => {
    return (
      profissionais?.find((p) => p.id_profissional === id)?.nome ?? `ID: ${id}`
    );
  };

  const getVacinaNome = (id: number) => {
    return vacinas?.find((v) => v.id_vacina === id)?.nome ?? `ID: ${id}`;
  };

  const getEstoqueStatus = (estoque: any) => {
    if (estoque.quantidade_disponivel <= 0) {
      return { text: "Sem estoque", color: "bg-red-100 text-red-800" };
    } else if (estoque.quantidade_disponivel <= estoque.quantidade_minima) {
      return { text: "Estoque baixo", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Disponível", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vacinas</h1>
        <p className="text-muted-foreground">
          Gerencie vacinas, estoques e aplicações
        </p>
      </div>

      <Tabs defaultValue="vacinas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vacinas" className="gap-2">
            <Syringe className="h-4 w-4" />
            Vacinas
          </TabsTrigger>
          <TabsTrigger value="estoques" className="gap-2">
            <Package className="h-4 w-4" />
            Estoques
          </TabsTrigger>
          <TabsTrigger value="aplicacoes" className="gap-2">
            <Calendar className="h-4 w-4" />
            Aplicações
          </TabsTrigger>
        </TabsList>

        {/* TAB VACINAS */}
        <TabsContent value="vacinas" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isCreateVacinaOpen}
              onOpenChange={setIsCreateVacinaOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetVacinaForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Vacina
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Vacina</DialogTitle>
                  <DialogDescription>
                    Cadastre uma nova vacina no sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-vacina-nome">Nome</Label>
                    <Input
                      id="create-vacina-nome"
                      placeholder="Ex: BCG, Hepatite B"
                      value={vacinaFormData.nome}
                      onChange={(e) =>
                        setVacinaFormData({
                          ...vacinaFormData,
                          nome: e.target.value,
                        })
                      }
                    />
                    {vacinaErrors.nome && (
                      <p className="text-sm text-red-600">
                        {vacinaErrors.nome}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-vacina-fabricante">
                      Fabricante (opcional)
                    </Label>
                    <Input
                      id="create-vacina-fabricante"
                      placeholder="Ex: Butantan, Fiocruz"
                      value={vacinaFormData.fabricante}
                      onChange={(e) =>
                        setVacinaFormData({
                          ...vacinaFormData,
                          fabricante: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-vacina-doses">
                      Doses Necessárias
                    </Label>
                    <Input
                      id="create-vacina-doses"
                      type="number"
                      min="1"
                      value={vacinaFormData.doses_necessarias}
                      onChange={(e) =>
                        setVacinaFormData({
                          ...vacinaFormData,
                          doses_necessarias: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateVacinaOpen(false);
                      resetVacinaForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateVacina}
                    disabled={createVacinaMutation.isPending}
                  >
                    {createVacinaMutation.isPending ? "Criando..." : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Vacinas</CardTitle>
              <CardDescription>
                Todas as vacinas cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVacinas ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : vacinas && vacinas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Doses</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vacinas.map((vacina) => (
                      <TableRow key={vacina.id_vacina}>
                        <TableCell className="font-medium">
                          {vacina.nome}
                        </TableCell>
                        <TableCell>{vacina.fabricante || "-"}</TableCell>
                        <TableCell>{vacina.doses_necessarias}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedVacina(vacina);
                                setVacinaFormData({
                                  nome: vacina.nome,
                                  fabricante: vacina.fabricante ?? "",
                                  doses_necessarias:
                                    vacina.doses_necessarias.toString(),
                                });
                                setIsEditVacinaOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedVacina(vacina);
                                setIsDeleteVacinaOpen(true);
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
                  Nenhuma vacina cadastrada
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
                  <DialogTitle>Novo Estoque de Vacina</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo estoque de vacinas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-estoque-vacina">Vacina</Label>
                    <select
                      id="create-estoque-vacina"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={estoqueFormData.id_vacina}
                      onChange={(e) =>
                        setEstoqueFormData({
                          ...estoqueFormData,
                          id_vacina: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione uma vacina</option>
                      {vacinas?.map((vac) => (
                        <option key={vac.id_vacina} value={vac.id_vacina}>
                          {vac.nome} - {vac.fabricante || "Sem fabricante"}
                        </option>
                      ))}
                    </select>
                    {estoqueErrors.id_vacina && (
                      <p className="text-sm text-red-600">
                        {estoqueErrors.id_vacina}
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
                      <Label htmlFor="create-estoque-disp">
                        Qtd. Disponível
                      </Label>
                      <Input
                        id="create-estoque-disp"
                        type="number"
                        min="0"
                        value={estoqueFormData.quantidade_disponivel}
                        onChange={(e) =>
                          setEstoqueFormData({
                            ...estoqueFormData,
                            quantidade_disponivel: e.target.value,
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
              <CardTitle>Estoques de Vacinas</CardTitle>
              <CardDescription>
                Controle de estoque de vacinas por posto
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
                      <TableHead>Vacina</TableHead>
                      <TableHead>Qtd. Mínima</TableHead>
                      <TableHead>Qtd. Disponível</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoques.map((estoque) => {
                      const status = getEstoqueStatus(estoque);
                      return (
                        <TableRow key={estoque.id_estoque_vacina}>
                          <TableCell className="font-medium">
                            #{estoque.id_estoque_vacina}
                          </TableCell>
                          <TableCell>{getVacinaNome(estoque.id_vacina)}</TableCell>
                          <TableCell>{estoque.quantidade_minima}</TableCell>
                          <TableCell>{estoque.quantidade_disponivel}</TableCell>
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
                                    id_vacina: estoque.id_vacina.toString(),
                                    quantidade_minima:
                                      estoque.quantidade_minima.toString(),
                                    quantidade_disponivel:
                                      estoque.quantidade_disponivel.toString(),
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

        {/* TAB APLICAÇÕES */}
        <TabsContent value="aplicacoes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isCreateAplicacaoOpen}
              onOpenChange={setIsCreateAplicacaoOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetAplicacaoForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Aplicação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Aplicação de Vacina</DialogTitle>
                  <DialogDescription>
                    Registre uma nova aplicação de vacina
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-aplicacao-paciente">Paciente</Label>
                    <select
                      id="create-aplicacao-paciente"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={aplicacaoFormData.id_paciente}
                      onChange={(e) =>
                        setAplicacaoFormData({
                          ...aplicacaoFormData,
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
                    {aplicacaoErrors.id_paciente && (
                      <p className="text-sm text-red-600">
                        {aplicacaoErrors.id_paciente}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-aplicacao-vacina">Vacina</Label>
                    <select
                      id="create-aplicacao-vacina"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={aplicacaoFormData.id_vacina}
                      onChange={(e) =>
                        setAplicacaoFormData({
                          ...aplicacaoFormData,
                          id_vacina: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione uma vacina</option>
                      {vacinas?.map((vac) => (
                        <option key={vac.id_vacina} value={vac.id_vacina}>
                          {vac.nome} - {vac.fabricante || "Sem fabricante"}
                        </option>
                      ))}
                    </select>
                    {aplicacaoErrors.id_vacina && (
                      <p className="text-sm text-red-600">
                        {aplicacaoErrors.id_vacina}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-aplicacao-profissional">
                      Profissional
                    </Label>
                    <select
                      id="create-aplicacao-profissional"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={aplicacaoFormData.id_profissional}
                      onChange={(e) =>
                        setAplicacaoFormData({
                          ...aplicacaoFormData,
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
                          {prof.nome} - {prof.especialidade || "N/A"}
                        </option>
                      ))}
                    </select>
                    {aplicacaoErrors.id_profissional && (
                      <p className="text-sm text-red-600">
                        {aplicacaoErrors.id_profissional}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-aplicacao-data">
                        Data e Hora
                      </Label>
                      <Input
                        id="create-aplicacao-data"
                        type="datetime-local"
                        value={aplicacaoFormData.data}
                        onChange={(e) =>
                          setAplicacaoFormData({
                            ...aplicacaoFormData,
                            data: e.target.value,
                          })
                        }
                      />
                      {aplicacaoErrors.data && (
                        <p className="text-sm text-red-600">
                          {aplicacaoErrors.data}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-aplicacao-dose">Nº da Dose</Label>
                      <Input
                        id="create-aplicacao-dose"
                        type="number"
                        min="1"
                        value={aplicacaoFormData.numero_dose}
                        onChange={(e) =>
                          setAplicacaoFormData({
                            ...aplicacaoFormData,
                            numero_dose: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateAplicacaoOpen(false);
                      resetAplicacaoForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateAplicacao}
                    disabled={createAplicacaoMutation.isPending}
                  >
                    {createAplicacaoMutation.isPending
                      ? "Registrando..."
                      : "Registrar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aplicações de Vacinas</CardTitle>
              <CardDescription>
                Histórico de aplicações de vacinas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAplicacoes ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : aplicacoes && aplicacoes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Vacina</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aplicacoes.map((aplicacao) => (
                      <TableRow key={aplicacao.id_aplicacao}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDateTime(aplicacao.data)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {getPacienteNome(aplicacao.id_paciente)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Syringe className="h-4 w-4 text-muted-foreground" />
                            {getVacinaNome(aplicacao.id_vacina)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getProfissionalNome(aplicacao.id_profissional)}
                        </TableCell>
                        <TableCell>{aplicacao.numero_dose}ª dose</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedAplicacao(aplicacao);
                                setAplicacaoFormData({
                                  id_paciente:
                                    aplicacao.id_paciente.toString(),
                                  id_vacina:
                                    aplicacao.id_vacina.toString(),
                                  id_profissional:
                                    aplicacao.id_profissional.toString(),
                                  data: new Date(aplicacao.data)
                                    .toISOString()
                                    .slice(0, 16),
                                  numero_dose: aplicacao.numero_dose.toString(),
                                });
                                setIsEditAplicacaoOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedAplicacao(aplicacao);
                                setIsDeleteAplicacaoOpen(true);
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
                  Nenhuma aplicação registrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOGS DE EDIÇÃO E EXCLUSÃO - VACINAS */}
      <Dialog open={isEditVacinaOpen} onOpenChange={setIsEditVacinaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vacina</DialogTitle>
            <DialogDescription>Atualize as informações da vacina</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-vacina-nome">Nome</Label>
              <Input
                id="edit-vacina-nome"
                value={vacinaFormData.nome}
                onChange={(e) =>
                  setVacinaFormData({ ...vacinaFormData, nome: e.target.value })
                }
              />
              {vacinaErrors.nome && (
                <p className="text-sm text-red-600">{vacinaErrors.nome}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vacina-fabricante">Fabricante</Label>
              <Input
                id="edit-vacina-fabricante"
                value={vacinaFormData.fabricante}
                onChange={(e) =>
                  setVacinaFormData({
                    ...vacinaFormData,
                    fabricante: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vacina-doses">Doses Necessárias</Label>
              <Input
                id="edit-vacina-doses"
                type="number"
                min="1"
                value={vacinaFormData.doses_necessarias}
                onChange={(e) =>
                  setVacinaFormData({
                    ...vacinaFormData,
                    doses_necessarias: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditVacinaOpen(false);
                resetVacinaForm();
                setSelectedVacina(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditVacina}
              disabled={updateVacinaMutation.isPending}
            >
              {updateVacinaMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteVacinaOpen} onOpenChange={setIsDeleteVacinaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a vacina{" "}
              <strong>{selectedVacina?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteVacinaOpen(false);
                setSelectedVacina(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteVacinaMutation.mutate({ id: selectedVacina.id_vacina })
              }
              disabled={deleteVacinaMutation.isPending}
            >
              {deleteVacinaMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGS DE EDIÇÃO E EXCLUSÃO - ESTOQUES */}
      <Dialog open={isEditEstoqueOpen} onOpenChange={setIsEditEstoqueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estoque</DialogTitle>
            <DialogDescription>Atualize as informações do estoque</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-estoque-vacina">Vacina</Label>
              <select
                id="edit-estoque-vacina"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={estoqueFormData.id_vacina}
                onChange={(e) =>
                  setEstoqueFormData({
                    ...estoqueFormData,
                    id_vacina: e.target.value,
                  })
                }
              >
                <option value="">Selecione uma vacina</option>
                {vacinas?.map((vac) => (
                  <option key={vac.id_vacina} value={vac.id_vacina}>
                    {vac.nome} - {vac.fabricante || "Sem fabricante"}
                  </option>
                ))}
              </select>
              {estoqueErrors.id_vacina && (
                <p className="text-sm text-red-600">
                  {estoqueErrors.id_vacina}
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
                <Label htmlFor="edit-estoque-disp">Qtd. Disponível</Label>
                <Input
                  id="edit-estoque-disp"
                  type="number"
                  min="0"
                  value={estoqueFormData.quantidade_disponivel}
                  onChange={(e) =>
                    setEstoqueFormData({
                      ...estoqueFormData,
                      quantidade_disponivel: e.target.value,
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
              <strong>#{selectedEstoque?.id_estoque_vacina}</strong>? Esta ação
              não pode ser desfeita.
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
                  id: selectedEstoque.id_estoque_vacina,
                })
              }
              disabled={deleteEstoqueMutation.isPending}
            >
              {deleteEstoqueMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGS DE EDIÇÃO E EXCLUSÃO - APLICAÇÕES */}
      <Dialog
        open={isEditAplicacaoOpen}
        onOpenChange={setIsEditAplicacaoOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aplicação</DialogTitle>
            <DialogDescription>
              Atualize as informações da aplicação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-aplicacao-paciente">Paciente</Label>
              <select
                id="edit-aplicacao-paciente"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={aplicacaoFormData.id_paciente}
                onChange={(e) =>
                  setAplicacaoFormData({
                    ...aplicacaoFormData,
                    id_paciente: e.target.value,
                  })
                }
              >
                <option value="">Selecione um paciente</option>
                {pacientes?.map((pac) => (
                  <option key={pac.id_paciente} value={pac.id_paciente}>
                    {pac.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aplicacao-vacina">Vacina</Label>
              <select
                id="edit-aplicacao-vacina"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={aplicacaoFormData.id_vacina}
                onChange={(e) =>
                  setAplicacaoFormData({
                    ...aplicacaoFormData,
                    id_vacina: e.target.value,
                  })
                }
              >
                <option value="">Selecione uma vacina</option>
                {vacinas?.map((vac) => (
                  <option key={vac.id_vacina} value={vac.id_vacina}>
                    {vac.nome} - {vac.fabricante || "Sem fabricante"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aplicacao-profissional">Profissional</Label>
              <select
                id="edit-aplicacao-profissional"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={aplicacaoFormData.id_profissional}
                onChange={(e) =>
                  setAplicacaoFormData({
                    ...aplicacaoFormData,
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
                    {prof.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-aplicacao-data">Data e Hora</Label>
                <Input
                  id="edit-aplicacao-data"
                  type="datetime-local"
                  value={aplicacaoFormData.data}
                  onChange={(e) =>
                    setAplicacaoFormData({
                      ...aplicacaoFormData,
                      data: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aplicacao-dose">Nº da Dose</Label>
                <Input
                  id="edit-aplicacao-dose"
                  type="number"
                  min="1"
                  value={aplicacaoFormData.numero_dose}
                  onChange={(e) =>
                    setAplicacaoFormData({
                      ...aplicacaoFormData,
                      numero_dose: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditAplicacaoOpen(false);
                resetAplicacaoForm();
                setSelectedAplicacao(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditAplicacao}
              disabled={updateAplicacaoMutation.isPending}
            >
              {updateAplicacaoMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteAplicacaoOpen}
        onOpenChange={setIsDeleteAplicacaoOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta aplicação de vacina? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAplicacaoOpen(false);
                setSelectedAplicacao(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteAplicacaoMutation.mutate({
                  id: selectedAplicacao.id_aplicacao,
                })
              }
              disabled={deleteAplicacaoMutation.isPending}
            >
              {deleteAplicacaoMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
