import { db } from "../database/setup.js";

export const getEmployeesPaginated = (page = 1, limit = 10, searchTerm = "") => {
    try {
        const offset = (page - 1) * limit;

        let whereClause = "";
        let searchParams = [];

        if (searchTerm && searchTerm.trim() !== "") {
            const pattern = `%${searchTerm.toLocaleLowerCase().trim()}%`;
            whereClause = `WHERE lower(name) LIKE ? OR lower(function) LIKE ?`;
            searchParams.push(pattern, pattern);
        }

        const { total } = db.prepare(
            `SELECT COUNT(*) as total 
            FROM employees
            ${whereClause}
        `).get(...searchParams);

        const employees = db.prepare(`
            SELECT id, name, function, cellphone FROM employees
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
        return {employees: [], totalCount: 0};
    }
}