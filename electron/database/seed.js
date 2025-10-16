import { v4 } from "uuid";

export const seedDB = (db) => {
  try {
    const stmtUser = db.prepare("INSERT INTO users (id, name, email, password) VALUES (@id, @name, @email, @password);");

    stmtUser.run({
      id: v4(),
      name: "Admin",
      email: "admin@mail.com",
      password: "$2b$10$puBkQd1odfODaeA5nqD.e.khdJercpOiji2/i.CX6D9NQKVlAx9u."
    });

    const stmtEmployee = db.prepare("INSERT INTO employees (id, name, function, constraints, disponibility) VALUES (@id, @name, @function, @constraints, @disponibility);");

    stmtEmployee.run({
      id: v4(),
      name: "João Silva",
      function: "Encanador",
      constraints: "Final de Semana, Feriados",
      disponibility: "Plantão da Tarde"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Mário Oliveira",
      function: "Operador da ETA",
      constraints: "Final de Semana, Plantão da ETA",
      disponibility: "Plantão da Tarde, Feriados"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Carlos Pereira",
      function: "Encanador",
      constraints: "Final de Semana, Feriados",
      disponibility: "Plantão da Manhã"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Francisco Henrique",
      function: "Encanador",
      constraints: "",
      disponibility: "Plantão da Manhã"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Tobias Alves",
      function: "Operador da ETA",
      constraints: "Final de Semana, Plantão da ETA",
      disponibility: ""
    });

    console.log("Database seed successfully completed.");
  } catch (error) {
    console.error(`Error on seeding database: ${JSON.stringify(error)}`);
  }
}