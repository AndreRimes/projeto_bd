import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createEstoqueVacina,
  deleteEstoqueVacina,
  getEstoqueVacinaById,
  getEstoquesVacinaByPosto,
  updateEstoqueVacina,
} from "./repository";

export const estoqueVacinaRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getEstoquesVacinaByPosto(ctx.posto.id_posto, ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getEstoqueVacinaById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estoque de vacina não encontrado",
        });
      }

      return result.rows[0];
    }),

  getByPosto: protectedProcedure
    .input(z.object({ id_posto: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getEstoquesVacinaByPosto(input.id_posto, ctx.db);
      return result.rows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id_vacina: z.number(),
        quantidade_minima: z.number().min(0).optional(),
        quantidade_disponivel: z.number().min(0).optional(),
        data_validade: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createEstoqueVacina(
        { ...input, id_posto: ctx.posto.id_posto },
        ctx.db,
      );

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar estoque de vacina",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_posto: z.number().optional(),
        id_vacina: z.number().optional(),
        quantidade_minima: z.number().min(0).optional(),
        quantidade_disponivel: z.number().min(0).optional(),
        data_validade: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getEstoqueVacinaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estoque de vacina não encontrado",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateEstoqueVacina(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar estoque de vacina",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getEstoqueVacinaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estoque de vacina não encontrado",
        });
      }

      await deleteEstoqueVacina(input.id, ctx.db);

      return {
        success: true,
        message: "Estoque de vacina excluído com sucesso",
      };
    }),
});
