import z, { ZodError } from "zod";
import { ScaleRepository } from "../repositories/scale.js";
import { EmployeeRepository } from "../repositories/employee.js";
import { randomUUID } from "crypto";
import { ScaleGenerator } from "./scale-generator.js";
import { SqliteError } from "better-sqlite3";
import { ScaleShift } from "../../../src/components/Scales.js";
import { SchedulingRule } from "./rules/SchedulingRule";
import { WeekendRestrictionRule, HolidayRestrictionRule, CollisionRule, ThreeDayRestRule } from "./rules/ConcreteRules";

export type CreateScaleParams = {
  month: number; // 1 to 12
  year: number;
  employeeIds: {
    ETA: string[];
    PLANTAO_TARDE: string[];
  },
  holidays: number[];
};

export type CreateScaleResult = {
  success: true;
  shifts: ScaleShift[];
} | {
  success: false;
  errorMessage: string;
}

export class ScaleService {
  private repository;
  private employeeRepository;
  private db: any;
  private rules: SchedulingRule[];

  constructor(db: any) {
    this.db = db;
    this.repository = new ScaleRepository(db);
    this.employeeRepository = new EmployeeRepository(db);

    this.rules = [
      new WeekendRestrictionRule(),
      new HolidayRestrictionRule(),
      new CollisionRule(),
      new ThreeDayRestRule()
    ];
  }

  getScale(params: any) {
    try {
      const { month, type } = getScaleSchema.parse(params);

      const scale = this.repository.findByMonthAndType(month, type);

      return scale;

    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      if (err instanceof SqliteError) {
        throw new Error(`Erro no banco de dados: ${err.code}`);
      }
      throw new Error(`Erro inesperado: ${JSON.stringify(err)}`);
    }
  }

  async createScale(params: CreateScaleParams): Promise<CreateScaleResult> {
    try {
      const { month, year, employeeIds, holidays } = createScaleSchema.parse(params);

      const allEmployeeIds = [
        ...employeeIds.ETA.map(emp => emp.id),
        ...employeeIds.PLANTAO_TARDE.map(emp => emp.id)
      ];

      type EmployeeDatabase = {
        id: string;
        name: string;
        function: string;
        cellphone: string;
        restrictions: string | null;
        availabilities: string;
        email: string;
      }

      const employeesWithRestrictions: EmployeeDatabase[] = this.employeeRepository.findByIds(allEmployeeIds);

      const mappedEmployees = employeesWithRestrictions
        .map(e => ({
          ...e,
          availabilities: e.availabilities === null
            ? []
            : e.availabilities.split(",") as ("ETA" | "PLANTAO_TARDE")[],
          restrictions: e.restrictions === null
            ? []
            : e.restrictions.split(",") as ('WEEKENDS' | 'HOLYDAYS')[],
        }));

      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;
      const previousMonthString = `${previousYear}-${previousMonth.toString().padStart(2, '0')}`;

      let previousMonthShifts: ScaleShift[] = [];

      const etaScalePrevious = this.repository.findByMonthAndType(previousMonthString, 'ETA');
      const plantaoScalePrevious = this.repository.findByMonthAndType(previousMonthString, 'PLANTAO_TARDE');

      if (etaScalePrevious) {
        previousMonthShifts = [...previousMonthShifts, ...etaScalePrevious.shifts];
      }

      if (plantaoScalePrevious) {
        previousMonthShifts = [...previousMonthShifts, ...plantaoScalePrevious.shifts];
      }

      const shifts = ScaleGenerator.generate({
        employees: mappedEmployees,
        month,
        year,
        holidays: holidays.map(holiday => new Date(year, month - 1, holiday)),
        previousMonthShifts: previousMonthShifts.length > 0 ? previousMonthShifts : undefined
      });

      const monthString = `${year}-${month.toString().padStart(2, '0')}`;

      // Create ETA scale
      const etaScaleId = randomUUID();
      await this.repository.create({
        id: etaScaleId,
        month: monthString,
        type: 'ETA',
        status: 'RASCUNHO'
      });

      // Create PLANTAO_TARDE scale
      const plantaoScaleId = randomUUID();
      await this.repository.create({
        id: plantaoScaleId,
        month: monthString,
        type: 'PLANTAO_TARDE',
        status: 'RASCUNHO'
      });

      // Create ETA holidays
      if (holidays && holidays.length > 0) {
        for (const day of holidays) {
          this.repository.addHoliday(etaScaleId, day);
        }
      }

      // Create PLANTAO_TARDE holidays
      if (holidays && holidays.length > 0) {
        for (const day of holidays) {
          this.repository.addHoliday(plantaoScaleId, day);
        }
      }

      // Create ETA shifts
      const etaShifts = shifts
        .filter(s => s.scaleType === "ETA")
        .map(shift => ({
          id: randomUUID(),
          scale_id: etaScaleId,
          employee_id: shift.employee_id,
          date: shift.dateStr
        }));

      if (etaShifts.length > 0) {
        await this.repository.createMultipleShifts(etaShifts);
      }

      // Create PLANTAO_TARDE shifts
      const plantaoShifts = shifts
        .filter(s => s.scaleType === "PLANTAO_TARDE")
        .map(shift => ({
          id: randomUUID(),
          scale_id: plantaoScaleId,
          employee_id: shift.employee_id,
          date: shift.dateStr
        }));

      if (plantaoShifts.length > 0) {
        await this.repository.createMultipleShifts(plantaoShifts);
      }

      return { success: true, shifts }
    } catch (err) {
      console.error(err);
      if (err instanceof ZodError) {
        return {
          success: false,
          errorMessage: `Erro de validação dos dados: ${err.message}`
        }
      }
      if (err instanceof SqliteError) {
        return {
          success: false,
          errorMessage: `Erro no banco de dados: ${err.code}`
        }
      }
      return {
        success: false,
        errorMessage: `Erro inesperado: ${err instanceof Error ? err.message : JSON.stringify(err)}`
      }
    }
  }

  updateManualShifts(params: any) {
    try {
      const { scaleId, date, finalEmployeeIds, force } = updateManualShiftsSchema.parse(params);

      const currentlyAllocatedIds = this.repository.getShiftsByDay(scaleId, date);
      const currentSet = new Set(currentlyAllocatedIds);
      const finalSet = new Set(finalEmployeeIds);

      const idsToAdd = finalEmployeeIds.filter((id: string) => !currentSet.has(id));
      const idsToRemove = currentlyAllocatedIds.filter((id: string) => !finalSet.has(id));

      if (!force && idsToAdd.length > 0) {
        const scaleType = this.repository.getScaleType(scaleId);

        const violations: string[] = [];

        type EmployeeData = { id: string, name: string, restrictions: string | null };
        const employeesToCheck: EmployeeData[] = this.employeeRepository.findByIds(idsToAdd);

        for (const employee of employeesToCheck) {
          const employeeName = employee.name;
          const restrictions = employee.restrictions ? employee.restrictions.split(',') : [];

          const employeeData = { 
            id: employee.id, 
            name: employeeName, 
            restrictions 
          };

          const context = {
            employee: employeeData,
            date: date,
            scaleType: scaleType,
            scaleId: scaleId,
            repository: this.repository,
            db: this.db
          };

          for (const rule of this.rules) {
            const error = rule.validate(context);
            if (error) {
                violations.push(error);
            }
          }
        }

        if (violations.length > 0) {
          return {
            success: false,
            requireConfirmation: true,
            violations: violations
          };
        }
      }

      this.repository.executeShiftTransaction((repo: any) => {
        idsToRemove.forEach((employeeId: string) => {
          repo.removeShift(scaleId, employeeId, date);
        });

        idsToAdd.forEach((employeeId: string) => {
          repo.addShift(scaleId, employeeId, date);
        });
      });

      return { success: true, changes: idsToAdd.length + idsToRemove.length };

    } catch (err) {
      if (err instanceof ZodError) throw new Error(`Erro validação: ${err.message}`);
      throw new Error(`Erro inesperado: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
  }

  getEmployeesForDayModal(params: any) {
    try {
      const { date, scaleType, scaleId } = getDayModalDataSchema.parse(params);

      const eligibleEmployees = this.employeeRepository.findEligible(scaleType);

      const allocatedEmployeeIds = this.repository.getShiftsByDay(scaleId, date);

      return {
        eligibleEmployees,
        allocatedEmployeeIds,
        date,
        scaleId,
        scaleType
      };
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação: ${err.message}`);
      }
      throw err;
    }
  }

  checkCollision(scaleId: string, employeeId: string, date: string, scaleType: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM scale_shifts 
      WHERE employee_id = ? AND date = ?
    `);

    const result = stmt.get(employeeId, date) as { count: number };

    return result.count > 0;
  }

  checkETARestRule(scaleId: string, employeeId: string, newDate: string): boolean {
    try {
      const stmt = this.db.prepare(`
        SELECT date FROM scale_shifts 
        WHERE scale_id = ? AND employee_id = ?
        ORDER BY date ASC
      `);

      const shifts = stmt.all(scaleId, employeeId) as Array<{ date: string }>;

      const newDay = parseInt(newDate.split('-')[2], 10);

      for (const shift of shifts) {
        const shiftDay = parseInt(shift.date.split('-')[2], 10);

        const diff = Math.abs(newDay - shiftDay);

        if (diff > 0 && diff < 4) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar regra de ETA:', error);
      return false;
    }
  }

  checkRestrictions(scaleId: string, employeeId: string, date: string): string | null {
    try {
      const dateObj = new Date(date + 'T12:00:00');
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dayOfMonth = parseInt(date.split('-')[2], 10);
      const isHoliday = this.repository.isHoliday(scaleId, dayOfMonth);

      const employees = this.employeeRepository.findByIds([employeeId]);
      if (employees.length === 0) return null;

      const employee = employees[0];
      const restrictions = employee.restrictions ? employee.restrictions.split(',') : [];

      if (isWeekend && restrictions.includes('WEEKENDS')) {
        return `O funcionário ${employee.name} possui restrição para Finais de Semana.`;
      }

      if (isHoliday && restrictions.includes('HOLYDAYS')) {
        return `O funcionário ${employee.name} possui restrição para Feriados.`;
      }

      return null;
    } catch (error) {
      console.error("Erro ao verificar restrições:", error);
      return null;
    }
  }

  createSobreaviso(params: any) {
    try {
      console.log('=== SERVICE: createSobreaviso ===');
      console.log('Params recebidos:', params);

      const { month, year, employeeIds } = createSobreavisoSchema.parse(params);

      console.log('Após parse - month:', month, 'year:', year);
      console.log('EmployeeIds ETA:', employeeIds.ETA);
      console.log('EmployeeIds PLANTAO_TARDE:', employeeIds.PLANTAO_TARDE);

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      console.log('Range de datas:', startDate, 'até', endDate);

      this.repository.deleteSobreavisosByDateRange(startDate, endDate);

      const sobreavisos = [];

      // Adicionar ETA
      for (const employee of employeeIds.ETA) {
        sobreavisos.push({
          id: randomUUID(),
          employee_id: employee.id,
          scale_type: 'ETA',
          start_date: startDate,
          end_date: endDate
        });
      }

      // Adicionar PLANTAO_TARDE
      for (const employee of employeeIds.PLANTAO_TARDE) {
        sobreavisos.push({
          id: randomUUID(),
          employee_id: employee.id,
          scale_type: 'PLANTAO_TARDE',
          start_date: startDate,
          end_date: endDate
        });
      }

      console.log('Total de sobreavisos a criar:', sobreavisos.length);
      console.log('Sobreavisos:', sobreavisos);

      if (sobreavisos.length > 0) {
        this.repository.createMultipleSobreavisos(sobreavisos);
      }

      return {
        success: true,
        message: 'Sobreavisos criados com sucesso',
        count: sobreavisos.length
      };

    } catch (err) {
      console.error('Erro em createSobreaviso:', err);
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      throw err;
    }
  }

  getSobreavisosByDate(date: string) {
    try {
      return this.repository.findSobreavisosByDate(date);
    } catch (error) {
      console.error("Erro ao buscar sobreavisos:", error);
      throw error;
    }
  }
}

const getScaleSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (use YYYY-MM)"),
  type: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido")
});

const createScaleSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  employeeIds: z.object({
    ETA: z.array(z.object({
      id: z.string(),
      name: z.string().optional(),
      restrictions: z.string().nullable()
    })),
    PLANTAO_TARDE: z.array(z.object({
      id: z.string(),
      name: z.string().optional(),
      availabilities: z.string().min(1),
      restrictions: z.string().nullable()
    }))
  }),
  holidays: z.array(z.number())
});

const getDayModalDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  scaleType: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido"),
  scaleId: z.string("ID da escala inválido")
});

const updateManualShiftsSchema = z.object({
  scaleId: z.string("ID da escala inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
  finalEmployeeIds: z.array(z.string("ID de funcionário inválido")),
  force: z.boolean().optional().default(false)
});

const createSobreavisoSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number(),
  employeeIds: z.object({
    ETA: z.array(z.object({
      id: z.string()
    })),
    PLANTAO_TARDE: z.array(z.object({
      id: z.string()
    }))
  })
});
