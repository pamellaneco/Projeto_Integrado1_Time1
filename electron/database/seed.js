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

    const stmtEmployee = db.prepare("INSERT INTO employees (id, name, function, cellphone) VALUES (@id, @name, @function, @cellphone);");

    stmtEmployee.run({
      id: v4(),
      name: "João Silva",
      function: "Encanador",
      cellphone: "(88) 1234-5678"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Mário Oliveira",
      function: "Operador da ETA",
      cellphone: "(88) 2345-6789"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Carlos Pereira",
      function: "Encanador",
      cellphone: "(88) 3456-7890"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Francisco Henrique",
      function: "Encanador",
      cellphone: "(88) 4567-8901"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Tobias Alves",
      function: "Operador da ETA",
      cellphone: "(88) 5678-9012"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Edivar Cruz",
      function: "Operador da ETA",
      cellphone: "(88) 6789-0123"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Abigail Marques",
      function: "Encanador",
      cellphone: "(88) 7890-1234"
    });

    stmtEmployee.run({
      id: v4(),
      name: "Tenebrio Otavio",
      function: "Operador da ETA",
      cellphone: "(88) 8901-2345"
    });

    console.log("Database seed successfully completed.");
  } catch (error) {
    console.error(`Error on seeding database: ${JSON.stringify(error)}`);
  }
}