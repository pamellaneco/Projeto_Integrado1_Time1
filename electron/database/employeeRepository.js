import { db } from "../database/setup.js";

export const getAllEmployees = () => {
    try {
        const stmt = db.prepare("SELECT * FROM employees");
        const employees = stmt.all();
        return employees;
    } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
        return [];
    }
}