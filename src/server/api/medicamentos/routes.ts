import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createEstoqueMedicamentos,
  createMedicamento,
  deleteEstoqueMedicamentos,
  deleteMedicamento,
  getAllMedicamentos,
  getEstoqueMedicamentosById,
  getEstoquesMedicamentosByPosto,
  getMedicamentoById,
  updateEstoqueMedicamentos,
  updateMedicamento,
} from "./repository";

// Router de Medicamentos
export const medicamentoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAllMedicamentos(ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getMedicamentoById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Medicamento não encontrado",
        });
      }

      return result.rows[0];
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createMedicamento(input, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar medicamento",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1, "Nome é obrigatório").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getMedicamentoById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Medicamento não encontrado",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateMedicamento(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar medicamento",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getMedicamentoById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Medicamento não encontrado",
        });
      }

      await deleteMedicamento(input.id, ctx.db);

      return {
        success: true,
        message: "Medicamento excluído com sucesso",
      };
    }),
});

// Router de Estoque de Medicamentos
export const estoqueMedicamentosRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getEstoquesMedicamentosByPosto(
      ctx.posto.id_posto,
      ctx.db,
    );
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getEstoqueMedicamentosById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estoque de medicamento não encontrado",
        });
      }

      return result.rows[0];
    }),

  getByPosto: protectedProcedure
    .input(z.object({ id_posto: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getEstoquesMedicamentosByPosto(
        input.id_posto,
        ctx.db,
      );
      return result.rows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id_medicamento: z.number(),
        quantidade_atual: z.number().min(0).optional(),
        quantidade_minima: z.number().min(0).optional(),
        data_validade: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createEstoqueMedicamentos(
        { ...input, id_posto: ctx.posto.id_posto },
        ctx.db,
      );

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar estoque de medicamento",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_posto: z.number().optional(),
        id_medicamento: z.number().optional(),
        quantidade_atual: z.number().min(0).optional(),
        quantidade_minima: z.number().min(0).optional(),
        data_validade: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getEstoqueMedicamentosById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estoque de medicamento não encontrado",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateEstoqueMedicamentos(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar estoque de medicamento",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getEstoqueMedicamentosById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estoque de medicamento não encontrado",
        });
      }

      await deleteEstoqueMedicamentos(input.id, ctx.db);

      return {
        success: true,
        message: "Estoque de medicamento excluído com sucesso",
      };
    }),
});
