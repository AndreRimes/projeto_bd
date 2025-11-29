import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createConsulta,
  deleteConsulta,
  getAllConsultas,
  getConsultaById,
  getConsultasByProfissional,
  updateConsulta,
} from "./repository";

export const consultaRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAllConsultas(ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getConsultaById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consulta não encontrada",
        });
      }

      return result.rows[0];
    }),

  getByProfissional: protectedProcedure
    .input(z.object({ id_profissional: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getConsultasByProfissional(
        input.id_profissional,
        ctx.db,
      );
      return result.rows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id_profissional: z.number(),
        observacoes: z.string().optional(),
        diagnostico: z.string().optional(),
        sintomas: z.string().optional(),
        data: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createConsulta(input, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar consulta",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_profissional: z.number().optional(),
        observacoes: z.string().optional(),
        diagnostico: z.string().optional(),
        sintomas: z.string().optional(),
        data: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getConsultaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consulta não encontrada",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateConsulta(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar consulta",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getConsultaById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Consulta não encontrada",
        });
      }

      await deleteConsulta(input.id, ctx.db);

      return {
        success: true,
        message: "Consulta excluída com sucesso",
      };
    }),
});
