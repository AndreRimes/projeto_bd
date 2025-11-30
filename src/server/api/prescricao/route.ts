import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  addMedicamentoToPrescricao,
  createPrescricao,
  deletePrescricao,
  getMedicamentosByPrescricao,
  getPrescricaoById,
  getPrescricoesByConsulta,
  removeMedicamentoFromPrescricao,
  setMedicamentosPrescricao,
  updatePrescricao,
} from "./repository";

export const prescricaoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query(
      `SELECT DISTINCT p.id_prescricao, p.id_consulta, p.data, p.conteudo
       FROM prescricao p
       JOIN consulta c ON p.id_consulta = c.id_consulta
       JOIN profissional prof ON c.id_profissional = prof.id_profissional
       WHERE prof.id_posto = $1
       ORDER BY p.data DESC`,
      [ctx.posto.id_posto],
    );
    return result.rows;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getPrescricaoById(input.id, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prescrição não encontrada",
        });
      }

      return result.rows[0];
    }),

  getByConsulta: protectedProcedure
    .input(z.object({ id_consulta: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getPrescricoesByConsulta(input.id_consulta, ctx.db);
      return result.rows;
    }),

  getMedicamentos: protectedProcedure
    .input(z.object({ id_prescricao: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await getMedicamentosByPrescricao(
        input.id_prescricao,
        ctx.db,
      );
      return result.rows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id_consulta: z.number(),
        data: z.date(),
        conteudo: z.string().optional(),
        medicamentos: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { medicamentos, ...prescricaoData } = input;

      const result = await createPrescricao(prescricaoData, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar prescrição",
        });
      }

      const prescricao = result.rows[0];

      if (medicamentos && medicamentos.length > 0 && prescricao) {
        await setMedicamentosPrescricao(
          prescricao.id_prescricao,
          medicamentos,
          ctx.db,
        );
      }

      return prescricao;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        id_consulta: z.number().optional(),
        data: z.date().optional(),
        conteudo: z.string().optional(),
        medicamentos: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getPrescricaoById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prescrição não encontrada",
        });
      }

      const { id, medicamentos, ...updateData } = input;

      if (medicamentos !== undefined) {
        await setMedicamentosPrescricao(id, medicamentos, ctx.db);
      }

      if (Object.keys(updateData).length > 0) {
        const result = await updatePrescricao(id, updateData, ctx.db);

        if (result.rows.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atualizar prescrição",
          });
        }

        return result.rows[0];
      }

      return existing.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getPrescricaoById(input.id, ctx.db);

      if (existing.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prescrição não encontrada",
        });
      }

      await deletePrescricao(input.id, ctx.db);

      return {
        success: true,
        message: "Prescrição excluída com sucesso",
      };
    }),

  addMedicamento: protectedProcedure
    .input(
      z.object({
        id_prescricao: z.number(),
        id_medicamento: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await addMedicamentoToPrescricao(
        input.id_prescricao,
        input.id_medicamento,
        ctx.db,
      );

      return {
        success: true,
        message: "Medicamento adicionado à prescrição",
      };
    }),

  removeMedicamento: protectedProcedure
    .input(
      z.object({
        id_prescricao: z.number(),
        id_medicamento: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await removeMedicamentoFromPrescricao(
        input.id_prescricao,
        input.id_medicamento,
        ctx.db,
      );

      return {
        success: true,
        message: "Medicamento removido da prescrição",
      };
    }),
});
