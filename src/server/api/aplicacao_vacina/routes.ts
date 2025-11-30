import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createAplicacaoVacina,
  deleteAplicacaoVacina,
  getAplicacaoVacinaById,
  getAplicacoesVacinaByPaciente,
  getAplicacoesVacinaByPosto,
  getAplicacoesVacinaByProfissional,
  updateAplicacaoVacina,
} from "./repository";

export const aplicacaoVacinaRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAplicacoesVacinaByPosto(ctx.posto.id_posto, ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAplicacaoVacinaById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação de vacina não encontrada",
        });
      }

      return result.rows[0];
    }),

  getByPaciente: protectedProcedure
    .input(z.object({ id_paciente: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAplicacoesVacinaByPaciente(
        input.id_paciente,
        ctx.db,
      );
      return result.rows;
    }),

  getByPosto: protectedProcedure
    .input(z.object({ id_posto: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAplicacoesVacinaByPosto(input.id_posto, ctx.db);
      return result.rows;
    }),

  getByProfissional: protectedProcedure
    .input(z.object({ id_profissional: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAplicacoesVacinaByProfissional(
        input.id_profissional,
        ctx.db,
      );
      return result.rows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id_paciente: z.number(),
        id_vacina: z.number(),
        id_profissional: z.number(),
        data: z.date(),
        numero_dose: z.number().min(1, "Número da dose deve ser no mínimo 1"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createAplicacaoVacina(
        { ...input, id_posto: ctx.posto.id_posto },
        ctx.db,
      );

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar aplicação de vacina",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_paciente: z.number().optional(),
        id_vacina: z.number().optional(),
        id_posto: z.number().optional(),
        id_profissional: z.number().optional(),
        data: z.date().optional(),
        numero_dose: z
          .number()
          .min(1, "Número da dose deve ser no mínimo 1")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getAplicacaoVacinaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação de vacina não encontrada",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateAplicacaoVacina(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar aplicação de vacina",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getAplicacaoVacinaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação de vacina não encontrada",
        });
      }

      await deleteAplicacaoVacina(input.id, ctx.db);

      return {
        success: true,
        message: "Aplicação de vacina excluída com sucesso",
      };
    }),
});
