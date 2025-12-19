import { randomUUID } from "crypto";

export class ScaleRepository {
  constructor(db) {
    this.db = db;
  }

  findByMonthAndType(month, type) {
    try {
      const scale = this.db.prepare(`
        SELECT id, month, type, status 
        FROM scales 
        WHERE month = ? AND type = ?
      `).get(month, type);

      if (!scale) {
        return null;
      }

      const shifts = this.db.prepare(`
        SELECT 
          s.id, 
          s.date as dateStr, 
          s.employee_id,
          e.name as employee_name,
          e.function as employee_function,
          e.email as employee_email
        FROM scale_shifts s
        JOIN employees e ON s.employee_id = e.id
        WHERE s.scale_id = ?
        ORDER BY s.date ASC
      `).all(scale.id);

      const holidays = this.db.prepare(`
        SELECT day
        FROM scale_holidays
        WHERE scale_id = ?
        ORDER BY day ASC
      `).all(scale.id);

      // Converter holidays para o formato esperado pelo frontend
      const holidaysFormatted = holidays.map(h => {
        const [year, monthNum] = scale.month.split('-');
        const dayStr = String(h.day).padStart(2, '0');
        return {
          date: `${year}-${monthNum}-${dayStr}`,
          name: 'Feriado'
        };
      });

      // Adicionar scaleType aos shifts baseado no tipo da escala
      const shiftsWithType = shifts.map(shift => ({
        ...shift,
        scaleType: scale.type
      }));

      return {
        ...scale,
        shifts: shiftsWithType,
        holidays: holidaysFormatted
      };

    } catch (error) {
      console.error("Erro no repositório de escalas:", error);
      throw new Error("Falha ao buscar escala no banco de dados.");
    }
  }

  create(scale) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scales (id, month, type, status)
        VALUES (?, ?, ?, ?)
      `);

      return stmt.run(scale.id, scale.month, scale.type, scale.status);
    } catch (error) {
      console.error("Erro ao criar escala:", error);
      throw new Error("Falha ao criar escala no banco de dados.");
    }
  }

  createShift(shift) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_shifts (id, scale_id, employee_id, date)
        VALUES (?, ?, ?, ?)
      `);

      return stmt.run(shift.id, shift.scale_id, shift.employee_id, shift.date);
    } catch (error) {
      console.error("Erro ao criar turno:", error);
      throw new Error("Falha ao criar turno no banco de dados.");
    }
  }

  createMultipleShifts(shifts) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_shifts (id, scale_id, employee_id, date)
        VALUES (?, ?, ?, ?)
      `);

      const transaction = this.db.transaction((shifts) => {
        for (const shift of shifts) {
          stmt.run(shift.id, shift.scale_id, shift.employee_id, shift.date);
        }
      });

      return transaction(shifts);
    } catch (error) {
      console.error("Erro ao criar múltiplos turnos:", error);
      throw new Error("Falha ao criar turnos no banco de dados.");
    }
  }

  getShiftsByDay(scaleId, date) {
    try {
      const shifts = this.db.prepare(`
        SELECT employee_id
        FROM scale_shifts
        WHERE scale_id = ? AND date = ?
      `).all(scaleId, date);

      return shifts.map(shift => shift.employee_id);
      
    } catch (error) {
      console.error("Erro ao buscar turnos por dia:", error);
      throw new Error(`Falha ao buscar turnos por dia no banco de dados: ${error.message}`);
    }
  }

  executeShiftTransaction(callback) {
    const transaction = this.db.transaction(callback);
    return transaction(this);
  }

  addShift(scaleID, employeeId, date) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_shifts(id, scale_id, employee_id, date)
        VALUES (?, ?, ?, ?)
      `);
      
      const shiftId = randomUUID();
      stmt.run(shiftId, scaleID, employeeId, date);

      return shiftId;
    } catch (error) {
      console.error('Erro ao adicionar turno:', error);
      throw new Error(`Falha ao adicionar turno no banco de dados: ${error.message}`);
    }
  }

  removeShift(scaleID, employeeId, date) {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM scale_shifts
        WHERE scale_id = ? AND employee_id = ? AND date = ?
      `);

      const result = stmt.run(scaleID, employeeId, date);

      if (result.changes === 0) {
        throw new Error("Turno não encontrado");
      }

      return result;
    } catch (error) {
      console.error('Erro ao remover turno:', error);
      throw new Error(`Falha ao remover turno no banco de dados: ${error.message}`);
    }
  }

  hasShiftOnDate(employeeId, date) {
    try {
      const result = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM scale_shifts 
        WHERE employee_id = ? AND date = ?
      `).get(employeeId, date);
      
      return result.count > 0;
    } catch (error) {
      console.error("Erro ao verificar turno existente:", error);
      return false;
    }
  }

  addHoliday(scaleId, day) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_holidays (id, scale_id, day)
        VALUES (?, ?, ?)
      `);
      stmt.run(randomUUID(), scaleId, day);
    } catch (error) {
      console.error("Erro ao adicionar feriado:", error);
      throw new Error("Falha ao salvar feriado.");
    }
  }

  isHoliday(scaleId, day) {
    try {
      const result = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM scale_holidays 
        WHERE scale_id = ? AND day = ?
      `).get(scaleId, day);
      
      return result.count > 0;
    } catch (error) {
      console.error("Erro ao verificar feriado:", error);
      return false;
    }
  }

  getScaleType(scaleId) {
    try {
      const result = this.db.prepare('SELECT type FROM scales WHERE id = ?').get(scaleId);
      return result ? result.type : null;
    } catch (error) {
      console.error("Erro ao buscar tipo da escala:", error);
      return null;
    }
  }

  createSobreaviso(sobreaviso) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO sobreavisos (id, employee_id, scale_type, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      return stmt.run(sobreaviso.id, sobreaviso.employee_id, sobreaviso.scale_type, sobreaviso.start_date, sobreaviso.end_date);
    } catch (error) {
      console.error("Erro ao criar sobreaviso:", error);
      throw new Error("Falha ao criar sobreaviso no banco de dados.");
    }
  }

  createMultipleSobreavisos(sobreavisos) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO sobreavisos (id, employee_id, scale_type, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertMany = this.db.transaction((items) => {
        for (const item of items) {
          stmt.run(item.id, item.employee_id, item.scale_type, item.start_date, item.end_date);
        }
      });

      insertMany(sobreavisos);
    } catch (error) {
      console.error("Erro ao criar múltiplos sobreavisos:", error);
      throw new Error("Falha ao criar sobreavisos no banco de dados.");
    }
  }

  findSobreavisosByDate(date) {
    try {
      const sobreavisos = this.db.prepare(`
        SELECT 
          s.id,
          s.employee_id,
          s.scale_type,
          s.start_date,
          s.end_date,
          e.name as employee_name,
          e.email as employee_email,
          e.function as employee_function
        FROM sobreavisos s
        JOIN employees e ON s.employee_id = e.id
        WHERE ? BETWEEN s.start_date AND s.end_date
        ORDER BY e.name ASC
      `).all(date);

      return sobreavisos;
    } catch (error) {
      console.error("Erro ao buscar sobreavisos:", error);
      throw new Error("Falha ao buscar sobreavisos no banco de dados.");
    }
  }

  deleteSobreavisosByDateRange(startDate, endDate) {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM sobreavisos 
        WHERE start_date = ? AND end_date = ?
      `);
      return stmt.run(startDate, endDate);
    } catch (error) {
      console.error("Erro ao deletar sobreavisos:", error);
      throw new Error("Falha ao deletar sobreavisos no banco de dados.");
    }
  }
}