import { v4 } from "uuid";

export const seedDB = (db) => {
  try {
    const stmt = db.prepare("INSERT INTO users (id, name, email, password) VALUES (@id, @name, @email, @password);");

    stmt.run({
      id: v4(),
      name: "Admin",
      email: "admin@mail.com",
      password: "$2b$10$puBkQd1odfODaeA5nqD.e.khdJercpOiji2/i.CX6D9NQKVlAx9u."
    });

    console.log("Database seed successfully completed.");
  } catch (error) {
    console.error(`Error on seeding database: ${JSON.stringify(error)}`);
  }
}