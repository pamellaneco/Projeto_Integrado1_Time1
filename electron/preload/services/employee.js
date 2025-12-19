import z, { ZodError } from "zod";
import { SqliteError } from "better-sqlite3";
import { EmployeeRepository } from "../repositories/employee.js";

export class EmployeeService {
  constructor(db) {
    this.repository = new EmployeeRepository(db);
  }

  getPaginated(params) {
    try {
      const parseResult = paginateEmployeeSchema.parse(params);

      return this.repository.getPaginated(
        parseResult.page,
        parseResult.limit,
        parseResult.searchTerm
      );
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos parâmetros de paginação: ${err.message}`);
      }
      throw new Error(`Erro inesperado: ${err.message}`);
    }
  }

  findEligible(params) {
    try {
      const parseResult = findEligibleSchema.parse(params || {});
      return this.repository.findEligible(parseResult.availabilityType);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos parâmetros de busca: ${err.message}`);
      }
      if (err instanceof SqliteError) {
        throw new Error(`Erro no banco de dados: ${err.message}`);
      }
      throw new Error(`Erro inesperado: ${err.message}`);
    }
  }

  create(payload) {
    try {
      const parseResult = createEmployeeSchema.parse(payload);
      return this.repository.create(parseResult);
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

  update(payload) {
    try {
      const parseResult = updateEmployeeSchema.parse(payload);
      this.repository.update(parseResult);
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

  delete(id) {
    try {
      const parseResult = z.uuid("Identificador inválido.").parse(id);
      this.repository.delete(parseResult);
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
}

const createEmployeeSchema = z.object({
  name: z.string("Nome é obrigatório.").min(4, "Mínimo de 4 caracteres"),
  function: z.string("Função é obrigatória."),
  email: z.string().email("Email inválido.").toLowerCase(),
  availabilities: z
    .array(z.enum(["ETA", "PLANTAO_TARDE"]))
    .min(1, "Funcionário deve ter pelo menos uma disponibilidade.")
    .refine(arr => new Set(arr).size === arr.length, {
      message: "Não são permitidos valores repetidos",
    }),
  restrictions: z
    .array(z.enum(["WEEKENDS", "HOLYDAYS"]))
    .refine(arr => new Set(arr).size === arr.length, {
      message: "Não são permitidos valores repetidos",
    }),
}).strict();

const updateEmployeeSchema = createEmployeeSchema.extend({
  id: z.uuid("Identificador inválido.")
});

const paginateEmployeeSchema = z.object({
  page: z.number("Página é obrigatória.").int().min(1, "Mínimo de 1").default(1),
  limit: z.number("Limite é obrigatório.").int().min(1, "Mínimo de 1").default(10),
  searchTerm: z.string().optional().default("")
}).strict();

const findEligibleSchema = z.object({
  availabilityType: z.string().optional()
});