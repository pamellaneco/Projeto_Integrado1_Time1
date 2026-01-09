import { ScaleShift } from "../../../src/components/Scales";

type Employee = {
  id: string;
  name: string;
  availabilities: ("ETA" | "PLANTAO_TARDE")[];
  restrictions: ('WEEKENDS' | 'HOLYDAYS')[];
}

type GenerateETAScaleParams = {
  employees: Array<Employee>;
  month: number;
  year: number;
  holidays: Date[];
}

export class ScaleGenerator {
  static generate({ employees, month, year, holidays }: GenerateETAScaleParams) {
    const daysInMonth = new Date(year, month, 0).getDate(); // trick

    // Carga de trabalho de cada funcionário medida em quantidade de dias.
    const workload = new Map<string, number>();

    const bothScalesEmployees: Employee[] = [];
    const etaEmployees: Employee[] = [];
    const plantaoTardeEmployees: Employee[] = [];

    for (const emp of employees) {
      const eta = emp.availabilities.includes("ETA");
      const plantaoTarde = emp.availabilities.includes("PLANTAO_TARDE");

      if (eta && plantaoTarde) {
        bothScalesEmployees.push(emp);
      } else if (eta) {
        etaEmployees.push(emp);
      } else if (plantaoTarde) {
        plantaoTardeEmployees.push(emp);
      }
    }

    const ctx = {
      ETA: new ETAScaleManager(
        month,
        year,
        daysInMonth,
        etaEmployees,
        workload
      ),
      PLANTAO_TARDE: new PlantaoTardeScaleManager(
        month,
        year,
        daysInMonth,
        holidays,
        plantaoTardeEmployees,
        workload
      )
    }

    // Primeiro passo: iterar todos os funcionários que trabalham nas duas escalas e popular tudo deles.
    for (const employee of bothScalesEmployees) {
      let day = ctx.ETA.getNextDayToPopulate(1);
      if (!day || day >= daysInMonth) continue;

      while (day <= daysInMonth) {
        ctx.ETA.shifts.set(day, employee.id);
        ctx.PLANTAO_TARDE.blocked.get(day)?.push(employee.id);
        workload.set(employee.id, 1 + (workload.get(employee.id) ?? 0));

        // Folga um dia nas duas escalas.
        if (day + 1 <= daysInMonth) {
          ctx.ETA.blocked.get(day + 1)?.push(employee.id);
          ctx.PLANTAO_TARDE.blocked.get(day + 1)?.push(employee.id);
        }

        // Se viável, trabalha no plantão da tarde no primeiro dia após a folga.
        if (day + 2 <= daysInMonth) {
          ctx.ETA.blocked.get(day + 2)?.push(employee.id);

          if (ctx.PLANTAO_TARDE.shouldPopulate(day + 2)) {
            ctx.PLANTAO_TARDE.shifts.set(day + 2, employee.id);
            workload.set(employee.id, 1 + (workload.get(employee.id) ?? 0));
          }
        }

        // Se viável, trabalha no plantão da tarde no segundo dia após a folga.
        if (day + 3 <= daysInMonth) {
          ctx.ETA.blocked.get(day + 3)?.push(employee.id);

          if (ctx.PLANTAO_TARDE.shouldPopulate(day + 3)) {
            ctx.PLANTAO_TARDE.shifts.set(day + 3, employee.id);
            workload.set(employee.id, 1 + (workload.get(employee.id) ?? 0));
          }
        }

        day += 4;
      }
    }

    // Segundo passo: popular os dias remanescentes da ETA.
    let nextEtaDay = ctx.ETA.getNextDayToPopulate(1);

    while (nextEtaDay !== null) {
      const candidates = ctx.ETA.getOrderedCandidates(nextEtaDay);

      if (!candidates.length) {
        throw new Error("Não existem funcionários suficientes na ETA para manter três dias de folga após um dia de trabalho.");
      }

      const choosed = candidates[0];
      ctx.ETA.shifts.set(nextEtaDay, choosed.id);
      workload.set(choosed.id, 1 + (workload.get(choosed.id) ?? 0));

      // Esse funcionário folga três dias na ETA.
      for (let i = 1; i <= 3; i++) {
        if (nextEtaDay + i <= daysInMonth) {
          ctx.ETA.blocked.get(nextEtaDay + i)?.push(choosed.id);
        }
      }

      nextEtaDay = ctx.ETA.getNextDayToPopulate(nextEtaDay + 1);
    }

    // Terceiro passo: popular os dias remanescentes do plantão da tarde.
    let nextPlantaoDay = ctx.PLANTAO_TARDE.getNextDayToPopulate(1);

    while (nextPlantaoDay !== null) {
      const candidates = ctx.PLANTAO_TARDE.getOrderedCandidates(nextPlantaoDay);
      let choosed = false;

      const date = new Date(year, month - 1, nextPlantaoDay);
      const dayOfWeek = date.getDay();
      const isHoliday = holidays.some(holiday => date.getTime() === holiday.getTime());

      // Seleciona o funcionário para esse dia
      for (const candidate of candidates) {
        const weekendRestriction = candidate.restrictions.includes("WEEKENDS");
        const holidaysRestriction = candidate.restrictions.includes("HOLYDAYS");

        if ((dayOfWeek === 0 || dayOfWeek === 6) && weekendRestriction) {
          continue; // employee does not work in weekends
        }

        if (isHoliday && holidaysRestriction) {
          continue; // employee does not work in holidays
        }

        choosed = true;
        ctx.PLANTAO_TARDE.shifts.set(nextPlantaoDay, candidate.id);
        workload.set(candidate.id, 1 + (workload.get(candidate.id) ?? 0));
        break;
      }

      if (!choosed) {
        throw new Error("Não existem funcionários suficientes no Plantão da Tarde para completar a escala.");
      } else {
        nextPlantaoDay = ctx.PLANTAO_TARDE.getNextDayToPopulate(nextPlantaoDay + 1);
      }
    }

    const shiftsETA: ScaleShift[] = Array
      .from(ctx.ETA.shifts.entries())
      .map(([day, employeeId]) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const employee = employees.find(e => e.id === employeeId)!;

        return {
          dateStr,
          employee_id: employeeId,
          employee_name: employee.name,
          scaleType: "ETA"
        };
      });

    const shiftsPLANTAO_TARDE: ScaleShift[] = Array
      .from(ctx.PLANTAO_TARDE.shifts.entries())
      .map(([day, employeeId]) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const employee = employees.find(e => e.id === employeeId)!;

        return {
          dateStr,
          employee_id: employeeId,
          employee_name: employee.name,
          scaleType: "PLANTAO_TARDE"
        };
      });

    return [...shiftsETA, ...shiftsPLANTAO_TARDE];
  }
}

class ETAScaleManager {
  public shifts: Map<number, string> = new Map(); // day -> employeeId
  public blocked: Map<number, string[]> = new Map(); // day -> employeeIds[]

  constructor(
    private month: number,
    private year: number,
    private daysInMonth: number,
    private employees: Employee[],
    private workload: Map<string, number>
  ) {
    Array
      .from({ length: daysInMonth })
      .forEach((_, index) => {
        this.blocked.set(index + 1, []);
      });
  }

  /**
   * Indica se um dia é válido para ser populado.
   */
  shouldPopulate(day: number) {
    const isInvalid = day < 1 || day > this.daysInMonth;
    const isPopulated = this.shifts.has(day);

    return !(isInvalid || isPopulated);
  }

  /**
   * Retorna o próximo dia a ser populado.
   */
  getNextDayToPopulate(from: number) {
    for (let i = 0; from + i <= this.daysInMonth; i++) {
      if (this.shouldPopulate(from + i)) {
        return from + i;
      }
    }

    return null;
  }

  /**
   * Indica se o funcionário trabalha nas duas escalas.
   */
  workInTwoScales(employee: Employee) {
    return employee.availabilities.length === 2;
  }

  /**
   * Retorna os candidatos por ordem de prioridade.
   */
  getOrderedCandidates(day: number): Employee[] {
    const blockedArray = this.blocked.get(day)!;

    const nonBlocked = this.employees.filter(e => !blockedArray.includes(e.id));

    const orderedPerWorkload = nonBlocked.sort((a, b) => {
      const aWorkLoad = this.workload.get(a.id) ?? 0;
      const bWorkLoad = this.workload.get(b.id) ?? 0;
      return aWorkLoad - bWorkLoad;
    });

    return orderedPerWorkload;
  }
}

class PlantaoTardeScaleManager {
  public shifts: Map<number, string> = new Map(); // day -> employeeId
  public blocked: Map<number, string[]> = new Map(); // day -> employeeIds[]

  constructor(
    private month: number,
    private year: number,
    private daysInMonth: number,
    private holidays: Date[],
    private employees: Employee[],
    private workload: Map<string, number>
  ) {
    Array
      .from({ length: daysInMonth })
      .forEach((_, index) => {
        this.blocked.set(index + 1, []);
      });
  }

  /**
   * Indica se um dia é válido para ser populado.
   */
  shouldPopulate(day: number) {
    const date = new Date(this.year, this.month - 1, day);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isInvalid = day < 1 || day > this.daysInMonth;
    const isPopulated = this.shifts.has(day);
    const isHoliday = this.holidays.some(holiday => date.getTime() === holiday.getTime());

    return !(isWeekend || isInvalid || isPopulated || isHoliday);
  }

  /**
   * Retorna o próximo dia a ser populado.
   */
  getNextDayToPopulate(from: number) {
    for (let i = 0; from + i <= this.daysInMonth; i++) {
      if (this.shouldPopulate(from + i)) {
        return from + i;
      }
    }

    return null;
  }

  /**
   * Retorna os candidatos por ordem de prioridade.
   */
  getOrderedCandidates(day: number): Employee[] {
    const blockedArray = this.blocked.get(day)!;

    const nonBlocked = this.employees.filter(e => !blockedArray.includes(e.id));

    const orderedPerWorkload = nonBlocked.sort((a, b) => {
      const aWorkLoad = this.workload.get(a.id) ?? 0;
      const bWorkLoad = this.workload.get(b.id) ?? 0;
      return aWorkLoad - bWorkLoad;
    });

    return orderedPerWorkload;
  }
}