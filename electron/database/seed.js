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

    const employees = [
      {
        name: "João Silva",
        function: "Operador da ETA",
        email: "joao.silva@example.com",
        availabilities: ["ETA"],
        restrictions: [] // No restrictions
      },
      {
        name: "Maria Santos",
        function: "Encanador",
        email: "maria.santos@example.com",
        availabilities: ["PLANTAO_TARDE"],
        restrictions: ["WEEKENDS"] // Cannot work weekends
      },
      {
        name: "Pedro Costa",
        function: "Operador da ETA",
        email: "pedro.costa@example.com",
        availabilities: ["ETA", "PLANTAO_TARDE"],
        restrictions: ["HOLYDAYS"] // Cannot work holidays
      },
      {
        name: "Ana Costa",
        function: "Operador da ETA",
        email: "ana.costa@saae.com",
        availabilities: ["ETA"],
        restrictions: ["WEEKENDS", "HOLYDAYS"] // Cannot work weekends or holidays
      },
      {
        name: "Carlos Ferreira",
        function: "Encanador",
        email: "carlos.ferreira@saae.com",
        availabilities: ["PLANTAO_TARDE"],
        restrictions: [] // No restrictions
      },
      {
        name: "Lucia Rocha",
        function: "Encanador",
        email: "lucia.rocha@saae.com",
        availabilities: ["PLANTAO_TARDE"],
        restrictions: ["WEEKENDS"] // Cannot work weekends
      },
      {
        name: "Roberto Lima",
        function: "Encanador",
        email: "roberto.lima@saae.com",
        availabilities: ["PLANTAO_TARDE"],
        restrictions: ["HOLYDAYS"] // Cannot work holidays
      },
      {
        name: "Fernanda Souza",
        function: "Encanador",
        email: "fernanda.souza@saae.com",
        availabilities: ["PLANTAO_TARDE"],
        restrictions: ["WEEKENDS", "HOLYDAYS"] // Cannot work weekends or holidays
      },
      {
        name: "Ricardo Alves",
        function: "Operador da ETA",
        email: "ricardo.alves@saae.com",
        availabilities: ["ETA", "PLANTAO_TARDE"],
        restrictions: [] // No restrictions, very flexible
      },
      {
        name: "Juliana Mendes",
        function: "Encanador",
        email: "juliana.mendes@saae.com",
        availabilities: ["ETA", "PLANTAO_TARDE"],
        restrictions: ["WEEKENDS"] // Multi-scale but no weekends
      },
      {
        name: "Marcos Pereira",
        function: "Operador da ETA",
        email: "marcos.pereira@saae.com",
        availabilities: ["ETA", "PLANTAO_TARDE"],
        restrictions: ["HOLYDAYS"] // Multi-scale but no holidays
      },
      {
        name: "Sandra Barbosa",
        function: "Encanador",
        email: "sandra.barbosa@saae.com",
        availabilities: ["ETA", "PLANTAO_TARDE"],
        restrictions: ["WEEKENDS", "HOLYDAYS"] // Multi-scale but restricted
      }
    ];

    for (const employee of employees) {
      employeeService.create(employee);
    }

    console.log("Database seeded with 12 test employees.");

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

    console.log("Seed complete.");

  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`Error on seeding database: ${message}`);
  }
}