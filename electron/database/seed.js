import { v4 } from "uuid";
import { faker } from "@faker-js/faker"

const generateFakeEmployee = () => ({
  id: v4(),
  name: faker.person.fullName(),
  function: faker.helpers.arrayElement(["Encanador", "Operador da ETA"]),
  cellphone: faker.phone.number()
});

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

    const employeesCount = 100;
    const employees = Array.from({ length: employeesCount}, generateFakeEmployee);

    const insertMany = db.transaction((emps) => {
      for (const emp of emps) {
        stmtEmployee.run(emp);
      }
    });

    insertMany(employees);

    console.log(`Database seeded with ${employeesCount} employees and Admin user.`);
  } catch (error) {
    console.error(`Error on seeding database: ${JSON.stringify(error)}`);
  }
}