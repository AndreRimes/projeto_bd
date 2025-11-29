"use client";

import { useRouter } from "next/navigation";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

const registerSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .max(100, "Matrícula deve ter no máximo 100 caracteres"),
  telefone: z
    .string()
    .max(50, "Telefone deve ter no máximo 50 caracteres")
    .optional(),
  endereco: z
    .string()
    .max(255, "Endereço deve ter no máximo 255 caracteres")
    .optional(),
  senha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
  confirmarSenha: z
    .string()
    .min(6, "A confirmação de senha deve ter no mínimo 6 caracteres"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPosto() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    nome?: string;
    matricula?: string;
    telefone?: string;
    endereco?: string;
    senha?: string;
    confirmarSenha?: string;
  }>({});

  const registerMutation = api.posto.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    try {
      const validatedData = registerSchema.parse({
        nome,
        matricula,
        telefone,
        endereco,
        senha,
        confirmarSenha,
      });

      await registerMutation.mutateAsync({
        nome: validatedData.nome,
        matricula: validatedData.matricula,
        telefone: validatedData.telefone,
        endereco: validatedData.endereco,
        senha: validatedData.senha,
      });

      router.push("/login");
      router.refresh();
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: {
          nome?: string;
          matricula?: string;
          telefone?: string;
          endereco?: string;
          senha?: string;
          confirmarSenha?: string;
        } = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof typeof errors;
          if (field) {
            errors[field] = error.message;
          }
        });
        setValidationErrors(errors);
      } else {
        setError("Erro ao criar conta. A matrícula pode já estar em uso.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Cadastro do Posto</CardTitle>
          <CardDescription>
            Preencha os dados para criar uma conta no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Posto</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite o nome do posto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={registerMutation.isPending}
                className="w-full"
              />
              {validationErrors.nome && (
                <p className="text-sm text-red-600">
                  {validationErrors.nome}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                type="text"
                placeholder="Digite a matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={registerMutation.isPending}
                className="w-full"
              />
              {validationErrors.matricula && (
                <p className="text-sm text-red-600">
                  {validationErrors.matricula}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input
                id="telefone"
                type="text"
                placeholder="Digite o telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={registerMutation.isPending}
                className="w-full"
              />
              {validationErrors.telefone && (
                <p className="text-sm text-red-600">
                  {validationErrors.telefone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço (opcional)</Label>
              <Input
                id="endereco"
                type="text"
                placeholder="Digite o endereço"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                disabled={registerMutation.isPending}
                className="w-full"
              />
              {validationErrors.endereco && (
                <p className="text-sm text-red-600">
                  {validationErrors.endereco}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={registerMutation.isPending}
                className="w-full"
              />
              {validationErrors.senha && (
                <p className="text-sm text-red-600">
                  {validationErrors.senha}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={registerMutation.isPending}
                className="w-full"
              />
              {validationErrors.confirmarSenha && (
                <p className="text-sm text-red-600">
                  {validationErrors.confirmarSenha}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              Já tem uma conta?{" "}
              <a href="/login" className="text-indigo-600 hover:underline">
                Fazer login
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
