import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createProfissional,
  deleteProfissional,
  getAllProfissionais,
  getProfissionaisByPosto,
  getProfissionalByCpf,
  getProfissionalById,
  updateProfissional,
} from "./repository";

export const profissionalRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAllProfissionais(ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getProfissionalById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profissional não encontrado",
        });
      }

      return result.rows[0];
    }),

  getMyProfissionais: protectedProcedure.query(async ({ ctx }) => {
    const result = await getProfissionaisByPosto(ctx.posto.id_posto, ctx.db);
    return result.rows;
  }),

  getByCpf: protectedProcedure
    .input(z.object({ cpf: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await getProfissionalByCpf(input.cpf, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profissional não encontrado",
        });
      }

      return result.rows[0];
    }),

  create: protectedProcedure
    .input(
      z.object({
        cpf: z.string().min(11).max(20),
        nome: z.string().min(1).max(255),
        especialidade: z.string().max(255).optional(),
        tipo: z.string().max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingProfissional = await getProfissionalByCpf(
        input.cpf,
        ctx.db,
      );

      if (existingProfissional.rows.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "CPF já cadastrado",
        });
      }

      const result = await createProfissional(
        {
          ...input,
          id_posto: ctx.posto.id_posto,
        },
        ctx.db,
      );

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar profissional",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_posto: z.number().optional(),
        cpf: z.string().min(11).max(20).optional(),
        nome: z.string().min(1).max(255).optional(),
        especialidade: z.string().max(255).optional(),
        tipo: z.string().max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getProfissionalById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profissional não encontrado",
        });
      }

      if (input.cpf && input.cpf !== existing.rows[0]!.cpf) {
        const cpfInUse = await getProfissionalByCpf(input.cpf, ctx.db);
        if (cpfInUse.rows.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CPF já cadastrado",
          });
        }
      }

      const { id, ...updateData } = input;
      const result = await updateProfissional(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar profissional",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getProfissionalById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profissional não encontrado",
        });
      }

      await deleteProfissional(input.id, ctx.db);

      return {
        success: true,
        message: "Profissional excluído com sucesso",
      };
    }),
});
