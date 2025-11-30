import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { agendamentoRouter } from "./agendamento/routes";
import { aplicacaoVacinaRouter } from "./aplicacao_vacina/routes";
import { consultaRouter } from "./consulta/routes";
import { estoqueVacinaRouter } from "./estoque_vacina/routes";
import {
  estoqueMedicamentosRouter,
  medicamentoRouter,
} from "./medicamentos/routes";
import { pacienteRouter } from "./paciente/routes";
import { postoRouter } from "./posto/route";
import { prescricaoRouter } from "./prescricao/route";
import { profissionalRouter } from "./profissional/routes";
import { vacinaRouter } from "./vacina/routes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posto: postoRouter,
  profissional: profissionalRouter,
  consulta: consultaRouter,
  agendamento: agendamentoRouter,
  paciente: pacienteRouter,
  vacina: vacinaRouter,
  estoqueVacina: estoqueVacinaRouter,
  aplicacaoVacina: aplicacaoVacinaRouter,
  medicamento: medicamentoRouter,
  estoqueMedicamentos: estoqueMedicamentosRouter,
  prescricao: prescricaoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
