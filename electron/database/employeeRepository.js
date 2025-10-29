import { db } from "../database/setup.js";

export const getEmployeesPaginated = (page = 1, limit = 10, searchTerm = "") => {
    try {
        const offset = (page - 1) * limit;

        let whereClause = "";
        let searchParams = [];

        if (searchTerm && searchTerm.trim() !== "") {
            const pattern = `${searchTerm.trim()}%`;
            whereClause = `WHERE name LIKE ? OR function LIKE ?`;
            searchParams.push(pattern, pattern);
        }

        const { total } = db.prepare(
            `SELECT COUNT(*) as total 
            FROM employees
            ${whereClause}
        `).get(...searchParams);

        const employees = db.prepare(`
            SELECT * FROM employees
            ${whereClause}
            LIMIT ?
            OFFSET ?
        `).all(...searchParams,limit, offset);

        return {
            employees: employees,
            totalCount: total
        };
    } catch (error) {
        console.error("Erro ao buscar funcionários paginados:", error);
        return {employees: [], totalCount: 0};
    }
}