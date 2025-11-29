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


const loginSchema = z.object({
  matricula: z
    .string()
    .min(1, "Matrícula é obrigatória"),
  senha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPosto() {
  const router = useRouter();
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    matricula?: string;
    senha?: string;
  }>({});

  const loginMutation = api.posto.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse({ matricula, senha });

      const result = await loginMutation.mutateAsync(validatedData); 

      // Store JWT token in localStorage
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      router.push("/");
      router.refresh();
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: { matricula?: string; senha?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0] === "matricula" || error.path[0] === "senha") {
            errors[error.path[0]] = error.message;
          }
        });
        setValidationErrors(errors);
      } else {
        setError("Erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login do Posto</CardTitle>
          <CardDescription>
            Digite sua matrícula e senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                type="text"
                placeholder="Digite sua matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
              {validationErrors.matricula && (
                <p className="text-sm text-red-600">
                  {validationErrors.matricula}
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
                disabled={isLoading}
                className="w-full"
              />
              {validationErrors.senha && (
                <p className="text-sm text-red-600">
                  {validationErrors.senha}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Esqueceu sua senha? Entre em contato com o administrador.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
