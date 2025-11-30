import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createPaciente,
  deletePaciente,
  getAllPacientes,
  getPacienteByCpf,
  getPacienteById,
  updatePaciente,
} from "./repository";

export const pacienteRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAllPacientes(ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getPacienteById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente não encontrado",
        });
      }

      return result.rows[0];
    }),

  getByCpf: protectedProcedure
    .input(z.object({ cpf: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await getPacienteByCpf(input.cpf, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente não encontrado",
        });
      }

      return result.rows[0];
    }),

  create: protectedProcedure
    .input(
      z.object({
        cpf: z.string().min(11, "CPF deve ter no mínimo 11 caracteres"),
        nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        data_nasc: z.date().optional(),
        foto: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getPacienteByCpf(input.cpf, ctx.db);
      if (existing.rows.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um paciente cadastrado com este CPF",
        });
      }

      const result = await createPaciente(input, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar paciente",
        });
      }

      return result.rows[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        cpf: z
          .string()
          .min(11, "CPF deve ter no mínimo 11 caracteres")
          .optional(),
        nome: z
          .string()
          .min(3, "Nome deve ter no mínimo 3 caracteres")
          .optional(),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        data_nasc: z.date().optional(),
        foto: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getPacienteById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente não encontrado",
        });
      }

      if (input.cpf && input.cpf !== existing.rows[0]!.cpf) {
        const cpfExists = await getPacienteByCpf(input.cpf, ctx.db);
        if (cpfExists.rows.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um paciente cadastrado com este CPF",
          });
        }
      }

      const { id, ...updateData } = input;
      const result = await updatePaciente(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar paciente",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getPacienteById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente não encontrado",
        });
      }

      await deletePaciente(input.id, ctx.db);

      return {
        success: true,
        message: "Paciente excluído com sucesso",
      };
    }),
});
