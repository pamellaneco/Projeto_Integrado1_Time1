import { v4 } from "uuid";
import { EmployeeService } from "../preload/services/employee.js";

export const seedDB = (db) => {
  try {
    const stmtUser = db.prepare("INSERT INTO users (id, name, email, password) VALUES (@id, @name, @email, @password);");

    stmtUser.run({
      id: v4(),
      name: "Admin",
      email: "admin@mail.com",
      password: "$2b$10$puBkQd1odfODaeA5nqD.e.khdJercpOiji2/i.CX6D9NQKVlAx9u."
    });

    const employeeService = new EmployeeService(db);

    // ETA employees with various restrictions
    const employee1Id = employeeService.create({
      name: "João Silva",
      function: "Operador da ETA",
      cellphone: "(85) 98888-1111",
      availabilities: ["ETA"],
      restrictions: [] // No restrictions
    });

    employeeService.create({
      name: "Maria Santos",
      function: "Operador da ETA",
      cellphone: "(85) 98888-2222",
      availabilities: ["ETA"],
      restrictions: ["WEEKENDS"] // Cannot work weekends
    });

    employeeService.create({
      name: "Pedro Oliveira",
      function: "Operador da ETA",
      cellphone: "(85) 98888-3333",
      availabilities: ["ETA"],
      restrictions: ["HOLYDAYS"] // Cannot work holidays
    });

    employeeService.create({
      name: "Ana Costa",
      function: "Operador da ETA",
      cellphone: "(85) 98888-4444",
      availabilities: ["ETA"],
      restrictions: ["WEEKENDS", "HOLYDAYS"] // Cannot work weekends or holidays
    });

    // PLANTAO_TARDE employees with various restrictions  
    const employee2Id = employeeService.create({
      name: "Carlos Ferreira",
      function: "Encanador",
      cellphone: "(85) 99999-1111",
      availabilities: ["PLANTAO_TARDE"],
      restrictions: [] // No restrictions
    });

    employeeService.create({
      name: "Lucia Rocha",
      function: "Encanador",
      cellphone: "(85) 99999-2222",
      availabilities: ["PLANTAO_TARDE"],
      restrictions: ["WEEKENDS"] // Cannot work weekends
    });

    employeeService.create({
      name: "Roberto Lima",
      function: "Encanador",
      cellphone: "(85) 99999-3333",
      availabilities: ["PLANTAO_TARDE"],
      restrictions: ["HOLYDAYS"] // Cannot work holidays
    });

    employeeService.create({
      name: "Fernanda Souza",
      function: "Encanador",
      cellphone: "(85) 99999-4444",
      availabilities: ["PLANTAO_TARDE"],
      restrictions: ["WEEKENDS", "HOLYDAYS"] // Cannot work weekends or holidays
    });

    // Multi-availability employees (can work both scales)
    employeeService.create({
      name: "Ricardo Alves",
      function: "Operador da ETA",
      cellphone: "(85) 97777-1111",
      availabilities: ["ETA", "PLANTAO_TARDE"],
      restrictions: [] // No restrictions, very flexible
    });

    employeeService.create({
      name: "Juliana Mendes",
      function: "Encanador",
      cellphone: "(85) 97777-2222",
      availabilities: ["ETA", "PLANTAO_TARDE"],
      restrictions: ["WEEKENDS"] // Multi-scale but no weekends
    });

    employeeService.create({
      name: "Marcos Pereira",
      function: "Operador da ETA",
      cellphone: "(85) 97777-3333",
      availabilities: ["ETA", "PLANTAO_TARDE"],
      restrictions: ["HOLYDAYS"] // Multi-scale but no holidays
    });

    employeeService.create({
      name: "Sandra Barbosa",
      function: "Encanador",
      cellphone: "(85) 97777-4444",
      availabilities: ["ETA", "PLANTAO_TARDE"],
      restrictions: ["WEEKENDS", "HOLYDAYS"] // Multi-scale but restricted
    });

    console.log("Database seeded with 12 test employees:");
    console.log("- 4 ETA-only employees with various restrictions");
    console.log("- 4 PLANTAO_TARDE-only employees with various restrictions");
    console.log("- 4 Multi-scale employees with various restrictions");
    console.log("Ready for scale generation testing!");

    const scaleIdETA = v4();
    const scaleIdTarde = v4();
    const mesTeste = "2025-11";

    const stmtScale = db.prepare(`
      INSERT INTO scales (id, month, type, status) 
      VALUES (?, ?, ?, ?)
    `);

    stmtScale.run(scaleIdETA, mesTeste, "ETA", "RASCUNHO");
    stmtScale.run(scaleIdTarde, mesTeste, "PLANTAO_TARDE", "RASCUNHO");

    const stmtShift = db.prepare(`
      INSERT INTO scale_shifts (id, scale_id, employee_id, date) 
      VALUES (?, ?, ?, ?)
    `);

    stmtShift.run(v4(), scaleIdETA, employee1Id, `${mesTeste}-01`);

    stmtShift.run(v4(), scaleIdETA, employee1Id, `${mesTeste}-05`);
    stmtShift.run(v4(), scaleIdTarde, employee2Id, `${mesTeste}-05`);

    stmtShift.run(v4(), scaleIdTarde, employee2Id, `${mesTeste}-10`);

  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`Error on seeding database: ${message}`);
  }
}