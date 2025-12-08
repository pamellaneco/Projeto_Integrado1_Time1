import z, { ZodError } from "zod";
import { ScaleRepository } from "../repositories/scale.js";

export class ScaleService {
  constructor(db) {
    this.repository = new ScaleRepository(db);
  }

  getScale(params) {
    try {
      const { month, type } = getScaleSchema.parse(params);

      const scale = this.repository.findByMonthAndType(month, type);

      return scale;

    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      if (err instanceof SqliteError) {
        throw new Error(`Erro no banco de dados: ${err.message}`);
      }
        throw new Error(`Erro inesperado: ${err.message}`);
    }
  }

  generate(params) {
    try {
      const { month, year, type } = generateScaleSchema.parse(params);

      // TODO: Implementar lógica de geração de escala
      // Por enquanto, retorna uma mensagem de sucesso simulada
      return {
        success: true,
        message: `Escala do tipo ${type} para ${month}/${year} será gerada`,
        data: {
          month,
          year,
          type,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      throw new Error(`Erro inesperado: ${err.message}`);
    }
  }
}

const getScaleSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (use YYYY-MM)"),
  type: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido")
});

const generateScaleSchema = z.object({
  month: z.number("Mês é obrigatório.").int().min(1, "Mês deve ser entre 1 e 12").max(12, "Mês deve ser entre 1 e 12"),
  year: z.number("Ano é obrigatório.").int().min(2000, "Ano inválido").max(2100, "Ano inválido"),
  type: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido")
}).strict();