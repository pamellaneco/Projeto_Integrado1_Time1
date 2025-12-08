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
  static generateETA({ employees, month, year, holidays }: GenerateETAScaleParams) {
    const daysInMonth = new Date(year, month, 0).getDate(); // trick

    // Mapa vai conter o funcionário escolhido para aquele turno com o número do dia como chave.
    const shiftMapETA = new Map<number, string>();
    const shiftMapPLANTAO_TARDE = new Map<number, string>();

    // Carga de trabalho de cada funcionário medida em quantidade de dias.
    const workload = new Map<string, number>();

    // Esse mapa vai conter o(s) funcionário(s) que não podem trabalhar em um determinado dia.
    const blockedMapETA = new Map<number, string[]>();
    const blockedMapPLANTAO_TARDE = new Map<number, string[]>();

    // Popula esse mapa de bloqueio com uma array vazio para cada dia.
    Array
      .from({ length: daysInMonth })
      .forEach((_, index) => {
        blockedMapETA.set(index + 1, []);
        blockedMapPLANTAO_TARDE.set(index + 1, []);
      });

    const workInTwoScales = (employee: Employee) => {
      return employee.availabilities.length === 2;
    }

    const isValidDayOfPLANTAO_TARDE = (day: number) => {
      if (day < 1 || day > daysInMonth) return false;

      const date = new Date(year, month - 1, day);
      // const dayOfWeek = date.getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) return false;

      if (shiftMapPLANTAO_TARDE.has(day)) return false;

      return !holidays.some(holiday => date.getTime() === holiday.getTime());
    }

    const getNextDayOfPLANTAO_TARDE = (baseDay: number) => {
      let dayCount = baseDay + 1;

      while (!isValidDayOfPLANTAO_TARDE(dayCount) && dayCount <= daysInMonth) {
        dayCount++;
      }

      return isValidDayOfPLANTAO_TARDE(dayCount) ? dayCount : null;
    }

    const getETAOrderedCandidates = (day: number) => {
      const blockedArray = blockedMapETA.get(day)!;

      const etaEmployees = employees.filter(e => e.availabilities.includes("ETA"));
      const nonBlocked = etaEmployees.filter(e => !blockedArray.includes(e.id));

      const workOnBoth = nonBlocked.filter(e => workInTwoScales(e));
      const workOnOne = nonBlocked.filter(e => !workInTwoScales(e));

      const ordered = workOnOne.sort((a, b) => {
        const aWorkLoad = workload.get(a.id) ?? 0;
        const bWorkLoad = workload.get(b.id) ?? 0;
        return aWorkLoad - bWorkLoad;
      });

      return [...workOnBoth, ...ordered];
    }

    // Popula os turnos da ETA
    for (let day = 1; day <= daysInMonth; day++) {
      const candidates = getETAOrderedCandidates(day);

      if (!candidates.length) {
        throw new Error("Não existem funcionários suficientes na ETA para manter três dias de folga após um dia de trabalho.");
      }

      // Seleciona o funcionário para esse dia
      const choosed = candidates[0];
      shiftMapETA.set(day, choosed.id);

      // Folga três dias na ETA
      for (let i = 1; i <= 3; i++) {
        if (day + i <= daysInMonth) {
          const blockArrayETA = blockedMapETA.get(day + i)!;
          blockArrayETA.push(choosed.id);
        }
      }
      // Não trabalha hoje ne amanhã no PLANTAO_TARDE
      const blockArrayPLANTAO_TARDE = blockedMapPLANTAO_TARDE.get(day)!;
      blockArrayPLANTAO_TARDE.push(choosed.id);

      if (day + 1 <= daysInMonth) {
        const blockArrayPLANTAO_TARDE = blockedMapPLANTAO_TARDE.get(day + 1)!;
        blockArrayPLANTAO_TARDE.push(choosed.id);
      }

      // Carga de trabalho aumenta
      workload.set(choosed.id, 1 + (workload.get(choosed.id) ?? 0));
    }

    // Para cada funcionário que está nas duas escalas
    employees.forEach((employee) => {
      if (!workInTwoScales(employee)) return;


      for (const [day, employeeId] of shiftMapETA) {
        if (employee.id !== employeeId) continue;
        // Para cada dia que ele trabalha na ETA

        // Trabalhe dois no PLANTAO_TARDE após um de folga, quando possível
        for (let i = 1; i <= 2; i++) {
          const nextDay = getNextDayOfPLANTAO_TARDE(day + i);
          if (nextDay === null) break;

          const blockedArray = blockedMapPLANTAO_TARDE.get(nextDay)!;
          if (blockedArray.includes(employeeId)) continue;

          shiftMapPLANTAO_TARDE.set(nextDay, employeeId);
          workload.set(employeeId, 1 + (workload.get(employeeId) ?? 0));
        }
      }
    });

    const getOrderedCandidatesOfPLANTAO_TARDE = (day: number) => {
      const blockedArray = blockedMapPLANTAO_TARDE.get(day)!;

      const plantaoTardeEmployees = employees.filter(e => e.availabilities.includes("PLANTAO_TARDE"));
      const nonBlocked = plantaoTardeEmployees.filter(e => !blockedArray.includes(e.id));

      const ordered = nonBlocked.sort((a, b) => {
        const aWorkLoad = workload.get(a.id) ?? 0;
        const bWorkLoad = workload.get(b.id) ?? 0;
        return aWorkLoad - bWorkLoad;
      });

      return ordered;
    }

    // Popula os turnos do PLANTAO_TARDE
    for (let day = 1; day <= daysInMonth; day++) {
      if (!isValidDayOfPLANTAO_TARDE(day)) continue;

      const candidates = getOrderedCandidatesOfPLANTAO_TARDE(day);

      if (!candidates.length) {
        throw new Error("Não existem funcionários suficientes no Plantão da Tarde para completar a escala.");
      }

      // Seleciona o funcionário para esse dia
      const choosed = candidates[0];
      shiftMapPLANTAO_TARDE.set(day, choosed.id);

      // Carga de trabalho aumenta
      workload.set(choosed.id, 1 + (workload.get(choosed.id) ?? 0));
    }

    const shiftsETA: ScaleShift[] = Array
      .from(shiftMapETA.entries())
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
      .from(shiftMapPLANTAO_TARDE.entries())
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