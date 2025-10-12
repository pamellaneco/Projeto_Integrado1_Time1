import { db } from "../../database/setup";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  login(email, password) {
    const stmt = db.prepare("SELECT * FROM users WHERE email = @email");
    const user = stmt.get({ email });

    if (!user) throw new Error("Usuário não encontrado.");

    const ok = bcryptjs.compareSync(password, user.password);
    if (!ok) throw new Error("Senha ou email inválidos.");

    return this.generateToken(user);
  }

  generateToken(user) {
    const payload = { id: user.id, name: user.name };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  }

  verifyToken(token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload;
    } catch (err) {
      // Token inválido ou expirado.
      return null;
    }
  }
}