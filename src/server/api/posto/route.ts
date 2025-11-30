import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateToken } from "~/lib/jwt";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { createPosto, getPostByMatricula } from "./repository";

export const postoRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        nome: z.string().min(1).max(255),
        matricula: z.string().min(1).max(100),
        telefone: z.string().max(50).optional(),
        endereco: z.string().max(255).optional(),
        senha: z.string().min(6).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hash = bcrypt.hashSync(input.senha, 10);

      const result = await createPosto(
        {
          matricula: input.matricula,
          nome: input.nome,
          telefone: input.telefone,
          endereco: input.endereco,
          senha: input.senha,
        },
        hash,
        ctx,
      );
    }),
  login: publicProcedure
    .input(
      z.object({
        matricula: z.string(),
        senha: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await getPostByMatricula(input.matricula, ctx.db);

      if (result.rows.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Matrícula ou senha incorreta",
        });
      }

      const posto = result.rows[0]!;

      if (!posto.ativo) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Conta desativada. Entre em contato com o administrador.",
        });
      }

      const isPasswordValid = await bcrypt.compare(input.senha, posto.senha);

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Matrícula ou senha incorreta",
        });
      }

      const token = generateToken({
        id_posto: posto.id_posto,
        matricula: posto.matricula,
        nome: posto.nome,
      });

      return {
        token,
        user: {
          id_posto: posto.id_posto,
          nome: posto.nome,
          matricula: posto.matricula,
          telefone: posto.telefone,
          endereco: posto.endereco,
          ativo: posto.ativo,
        },
      };
    }),
});
