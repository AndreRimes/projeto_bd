import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createVacina,
  deleteVacina,
  getAllVacinas,
  getVacinaById,
  updateVacina,
} from "./repository";

export const vacinaRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAllVacinas(ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getVacinaById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacina não encontrada",
        });
      }

      return result.rows[0];
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        fabricante: z.string().optional(),
        doses_necessarias: z.number().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createVacina(input, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar vacina",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1, "Nome é obrigatório").optional(),
        fabricante: z.string().optional(),
        doses_necessarias: z.number().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getVacinaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacina não encontrada",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateVacina(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar vacina",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getVacinaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacina não encontrada",
        });
      }

      await deleteVacina(input.id, ctx.db);

      return {
        success: true,
        message: "Vacina excluída com sucesso",
      };
    }),
});
