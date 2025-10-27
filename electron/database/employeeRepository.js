import { db } from "../database/setup.js";

export const getEmployeesPaginated = (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        const { total } = db.prepare("SELECT COUNT(*) as total FROM employees").get();

        const employees = db.prepare(`
            SELECT * FROM employees
            FROM employees
            LIMIT ?
            OFFSET ?
        `).all(limit, offset);

        return {
            employees: employees,
            total: total
        };
    } catch (error) {
        console.error("Erro ao buscar funcionários paginados:", error);
        return {employees: [], total: 0};
    }
}