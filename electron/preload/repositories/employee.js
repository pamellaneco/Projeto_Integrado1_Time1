export class EmployeeRepository {
  constructor(db) {
    this.db = db;
  }

  getPaginated(page = 1, limit = 10, searchTerm = "") {
    try {
      const offset = (page - 1) * limit;

      let whereClause = "";
      let searchParams = [];
      let baseWhere = `WHERE deleted = 0`;

      if (searchTerm && searchTerm.trim() !== "") {
        const pattern = `%${searchTerm.toLocaleLowerCase().trim()}%`;

        whereClause = `${baseWhere} AND (lower(name) LIKE ? OR lower(function) LIKE ?)`;
        searchParams.push(pattern, pattern);
      } else {
        whereClause = baseWhere;
      }

      const { total } = this.db.prepare(
        `SELECT COUNT(*) as total 
         FROM employees
         ${whereClause}
      `).get(...searchParams);

      const employees = this.db.prepare(`
          SELECT
          e.id,
          e.name,
          e."function",
          e.cellphone,
          (
            SELECT GROUP_CONCAT(r.type)
            FROM employee_restrictions r
            WHERE r.employee_id = e.id
          ) AS restrictions,
          (
            SELECT GROUP_CONCAT(a.type)
            FROM employee_availabilities a
            WHERE a.employee_id = e.id
          ) AS availabilities
        FROM employees e
          ${whereClause}
          ORDER BY name
          LIMIT ?
          OFFSET ?
      `).all(...searchParams, limit, offset);

      return {
        employees: employees,
        totalCount: total
      };
    } catch (error) {
      console.error("Erro ao buscar funcionários paginados:", error);
      return { employees: [], totalCount: 0 };
    }
  }

  findByIds(employeeIds) {
    try {
      if (!employeeIds || employeeIds.length === 0) {
        return [];
      }

      const placeholders = employeeIds.map(() => '?').join(',');

      const employees = this.db.prepare(`
        SELECT
          e.id,
          e.name,
          e."function",
          e.cellphone,
          (
            SELECT GROUP_CONCAT(r.type)
            FROM employee_restrictions r
            WHERE r.employee_id = e.id
          ) AS restrictions,
          (
            SELECT GROUP_CONCAT(a.type)
            FROM employee_availabilities a
            WHERE a.employee_id = e.id
          ) AS availabilities
        FROM employees e
        WHERE e.id IN (${placeholders}) AND e.deleted = 0
        ORDER BY e.name
      `).all(...employeeIds);

      return employees;
    } catch (error) {
      console.error("Erro ao buscar funcionários por IDs:", error);
      return [];
    }
  }

  findEligible(availabilityType) {
    try {
      let selectClause = `
        SELECT
          e.id,
          e.name,
          e."function",
          (
            SELECT GROUP_CONCAT(r.type)
            FROM employee_restrictions r
            WHERE r.employee_id = e.id
          ) AS restrictions,
          (
            SELECT GROUP_CONCAT(a.type)
            FROM employee_availabilities a
            WHERE a.employee_id = e.id
          ) AS availabilities
        FROM employees e
      `;

      let joinClause = '';
      let whereClause = `WHERE e.deleted = 0`;
      const params = [];

      if (availabilityType && availabilityType.trim() !== '') {
        joinClause = `
          JOIN employee_availabilities ea 
          ON ea.employee_id = e.id
        `;
        whereClause += ` AND ea.type = ?`;
        params.push(availabilityType);
      }

      const stmt = this.db.prepare(`
        ${selectClause}
        ${joinClause}
        ${whereClause}
        GROUP BY e.id, e.name, e."function", e.cellphone 
        ORDER BY e.name
      `);

      const employees = stmt.all(...params);

      return employees;

    } catch (error) {
      console.error("Erro ao buscar funcionários elegíveis:", error);
      throw new Error(`Falha no repositório buscar elegíveis: ${error.message}`);
    }
  }

  create(payload) {
    return this.db.transaction(() => {
      const userInsert = this.db.prepare("INSERT INTO employees (id, name, function, cellphone) VALUES (@id, @name, @function, @cellphone)");

      const insertAvailability = this.db.prepare(
        "INSERT INTO employee_availabilities (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      const insertRestriction = this.db.prepare(
        "INSERT INTO employee_restrictions (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      const employeeId = crypto.randomUUID();

      userInsert.run({
        id: employeeId,
        name: payload.name,
        function: payload.function,
        cellphone: payload.cellphone,
      });

      for (const availability of payload.availabilities) {
        insertAvailability.run({
          id: crypto.randomUUID(),
          employeeId,
          type: availability
        });
      }

      for (const restriction of payload.restrictions) {
        insertRestriction.run({
          id: crypto.randomUUID(),
          employeeId,
          type: restriction
        });
      }

      return employeeId;
    })()
  }

  update(payload) {
    this.db.transaction(() => {
      const userUpdate = this.db.prepare("UPDATE employees SET name=@name, function=@function, cellphone=@cellphone WHERE id=@id");

      const employeeId = payload.id;

      userUpdate.run({
        id: employeeId,
        name: payload.name,
        function: payload.function,
        cellphone: payload.cellphone,
      });

      this.db
        .prepare("DELETE FROM employee_availabilities WHERE employee_id=@employeeId")
        .run({ employeeId });

      const insertAvailability = this.db.prepare(
        "INSERT INTO employee_availabilities (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      for (const availability of payload.availabilities) {
        insertAvailability.run({
          id: crypto.randomUUID(),
          employeeId,
          type: availability
        });
      }

      this.db
        .prepare("DELETE FROM employee_restrictions WHERE employee_id=@employeeId")
        .run({ employeeId });

      const insertRestriction = this.db.prepare(
        "INSERT INTO employee_restrictions (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      for (const restriction of payload.restrictions) {
        insertRestriction.run({
          id: crypto.randomUUID(),
          employeeId,
          type: restriction
        });
      }
    })()
  }

  delete(id) {
    this.db.transaction(() => {
      this.db.prepare("UPDATE employees SET deleted = 1 WHERE id = @id").run({ id });
    })()
  }
}