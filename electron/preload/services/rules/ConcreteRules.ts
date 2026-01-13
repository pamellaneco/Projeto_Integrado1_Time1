import { SchedulingRule, RuleContext } from "./SchedulingRule";

export class WeekendRestrictionRule implements SchedulingRule {
  validate({ employee, date }: RuleContext): string | null {
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend && employee.restrictions.includes('WEEKENDS')) {
      return `${employee.name} possui restrição para Finais de Semana.`;
    }
    return null;
  }
}

export class HolidayRestrictionRule implements SchedulingRule {
  validate({ employee, date, scaleId, repository }: RuleContext): string | null {
    const dayOfMonth = parseInt(date.split('-')[2], 10);
    const isHoliday = repository.isHoliday(scaleId, dayOfMonth);

    if (isHoliday && employee.restrictions.includes('HOLYDAYS')) {
      return `${employee.name} possui restrição para Feriados.`;
    }
    return null;
  }
}

export class CollisionRule implements SchedulingRule {
  validate({ employee, date, repository }: RuleContext): string | null {
    const hasShift = repository.hasShiftOnDate(employee.id, date);
    if (hasShift) {
      return `${employee.name} já está alocado em outra escala neste dia.`;
    }
    return null;
  }
}

export class ThreeDayRestRule implements SchedulingRule {
  validate({ employee, date, scaleType, scaleId, db }: RuleContext): string | null {
    if (scaleType !== 'ETA') return null;

    try {
      const stmt = db.prepare(`
        SELECT date FROM scale_shifts 
        WHERE scale_id = ? AND employee_id = ?
        ORDER BY date ASC
      `);
      
      const shifts = stmt.all(scaleId, employee.id) as Array<{ date: string }>;
      const newDay = parseInt(date.split('-')[2], 10);

      for (const shift of shifts) {
        const shiftDay = parseInt(shift.date.split('-')[2], 10);
        const diff = Math.abs(newDay - shiftDay);
        if (diff > 0 && diff < 4) {
           return `${employee.name} não cumpre o descanso obrigatório de 3 dias da ETA.`;
        }
      }
    } catch (err) {
      console.error("Erro na validação de descanso ETA", err);
    }
    return null;
  }
}