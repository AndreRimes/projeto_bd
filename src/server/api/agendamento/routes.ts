import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createConsulta } from "../consulta/repository";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createAgendamento,
  deleteAgendamento,
  getAgendamentoById,
  getAgendamentosByConsulta,
  getAgendamentosByPaciente,
  getAgendamentosByStatus,
  getAllAgendamentos,
  updateAgendamento,
} from "./repository";

export const agendamentoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await getAllAgendamentos(ctx.db);
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAgendamentoById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agendamento não encontrado",
        });
      }

      return result.rows[0];
    }),

  getByPaciente: protectedProcedure
    .input(z.object({ id_paciente: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAgendamentosByPaciente(input.id_paciente, ctx.db);
      return result.rows;
    }),

  getByConsulta: protectedProcedure
    .input(z.object({ id_consulta: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getAgendamentosByConsulta(input.id_consulta, ctx.db);
      return result.rows;
    }),

  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await getAgendamentosByStatus(input.status, ctx.db);
      return result.rows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id_paciente: z.number(),
        id_profissional: z.number(),
        motivo: z.string().optional(),
        status: z.string().optional(),
        data: z.date(),
        observacoes: z.string().optional(),
        diagnostico: z.string().optional(),
        sintomas: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First, create the consulta
      const consultaResult = await createConsulta(
        {
          id_profissional: input.id_profissional,
          observacoes: input.observacoes,
          diagnostico: input.diagnostico,
          sintomas: input.sintomas,
          data: input.data,
        },
        ctx.db,
      );

      if (consultaResult.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar consulta",
        });
      }

      const consulta = consultaResult.rows[0]!;

      // Then, create the agendamento with the consulta id
      const result = await createAgendamento(
        {
          id_paciente: input.id_paciente,
          id_consulta: consulta.id_consulta,
          motivo: input.motivo,
          status: input.status,
          data: input.data,
        },
        ctx.db,
      );

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar agendamento",
        });
      }

      return {
        agendamento: result.rows[0],
        consulta: consulta,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_paciente: z.number().optional(),
        id_consulta: z.number().optional(),
        motivo: z.string().optional(),
        status: z.string().optional(),
        data: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getAgendamentoById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agendamento não encontrado",
        });
      }

      const { id, ...updateData } = input;
      const result = await updateAgendamento(id, updateData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar agendamento",
        });
      }

      return result.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getAgendamentoById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agendamento não encontrado",
        });
      }

      await deleteAgendamento(input.id, ctx.db);

      return {
        success: true,
        message: "Agendamento excluído com sucesso",
      };
    }),
});
