"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function Page() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
              PS
            </div>
            <h1 className="text-xl font-bold text-gray-900">Sistema de Postos de Saúde</h1>
          </div>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="destructive">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button>Cadastrar Posto</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-5xl font-bold text-gray-900">
            Gestão Inteligente de <span className="text-blue-600">Postos de Saúde</span>
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Sistema completo para gerenciar pacientes, consultas, vacinas, medicamentos e profissionais de saúde em um só lugar.
          </p>
          <div className="flex gap-4 justify-center">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg">
                    Começar Agora
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg">
                    Fazer Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg">
                  Ir para Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Funcionalidades Principais
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <CardTitle>Gestão de Pacientes</CardTitle>
              <CardDescription>
                Cadastro completo de pacientes com histórico médico, dados pessoais e documentação.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>
                Sistema completo de agendamento de consultas com controle de status e notificações.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <CardTitle>Controle de Vacinas</CardTitle>
              <CardDescription>
                Registro de aplicações, controle de estoque e acompanhamento de carteira de vacinação.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <CardTitle>Estoque de Medicamentos</CardTitle>
              <CardDescription>
                Gestão completa de estoque com alertas de quantidade mínima e validade.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle>Prescrições Médicas</CardTitle>
              <CardDescription>
                Emissão e gerenciamento de prescrições vinculadas às consultas realizadas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <CardTitle>Gestão de Profissionais</CardTitle>
              <CardDescription>
                Cadastro e controle de profissionais de saúde vinculados ao posto.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Tecnologia Avançada
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">🔒 Segurança</CardTitle>
                <CardDescription>
                  Autenticação JWT, criptografia de senhas e proteção de dados sensíveis seguindo as melhores práticas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">⚡ Performance</CardTitle>
                <CardDescription>
                  Views otimizadas, stored procedures e triggers para garantir rapidez e eficiência nas operações.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">📊 Relatórios</CardTitle>
                <CardDescription>
                  Dashboard com estatísticas em tempo real e relatórios detalhados sobre todas as operações do posto.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h3 className="mb-4 text-3xl font-bold text-gray-900">
            Pronto para modernizar seu posto de saúde?
          </h3>
          <p className="mb-8 text-lg text-gray-600">
            Comece a usar agora mesmo e transforme a gestão do seu posto de saúde com tecnologia de ponta.
          </p>
          {!isLoggedIn && (
            <Link href="/register">
              <Button size="lg" className="text-lg">
                Cadastrar Meu Posto
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Sistema de Postos de Saúde. Todos os direitos reservados.</p>
          <p className="mt-2 text-sm">
            Desenvolvido com Next.js, tRPC, PostgreSQL e muito ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}