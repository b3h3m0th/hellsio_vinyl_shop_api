import * as express from "express";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { generateAccessToken } from "../authorization/token";
import * as bcrypt from "bcrypt";
import authenticateAdminToken from "../authorization/admin";
import db from "../database";
import { MysqlError } from "mysql";
import { RefreshTokens } from "../authorization/token";
const router = express.Router();

router.get("/", authenticateAdminToken, (req: Request, res: Response) => {
  return res.send("Welcome to Hellsio vinyl shop admin endpoint");
});

router.post("/token", async (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!RefreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: jwt.JsonWebTokenError, user: any) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken({ username: user.username });
      return res.json({ accessToken: accessToken });
    }
  );
});

router.post("/login", async (req: Request, res: Response) => {
  const incommingUser: { username: string; password: string } = {
    username: req.body.username,
    password: req.body.password,
  };

  db.query(
    `SELECT user_id, password FROM user WHERE username = ? && Role_role_id=1`,
    [incommingUser.username],
    (err: MysqlError, results) => {
      if (err)
        return res
          .status(406)
          .json({ error: "An error occured while logging you in" });
      else if (results.length === 0) {
        return res.status(406).json({ error: "Wrong username or password" });
      }

      if (!bcrypt.compareSync(incommingUser.password, results[0].password)) {
        return res.status(406).json({ error: "Wrong username or password" });
      } else {
        const userToSign = { email: req.body.username };

        const accessToken = generateAccessToken(userToSign);
        const refreshToken = jwt.sign(
          userToSign,
          process.env.REFRESH_TOKEN_SECRET
        );

        RefreshTokens.add(refreshToken, results[0].user_id);

        return res.json({
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      }
    }
  );
});

router.delete("/logout", async (req: Request, res: Response) => {
  if (req.headers["token"])
    RefreshTokens.remove(req.headers["token"].toString());
  return res.sendStatus(204);
});

router.get(
  "/orders",
  authenticateAdminToken,
  async (req: Request, res: Response) => {
    return res.json({ endpoint: "orders" });
  }
);

router.get(
  "/products",
  authenticateAdminToken,
  async (req: Request, res: Response) => {
    db.query(`SELECT * from album`, null, (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) res.status(404).json({ error: "empty" });
      return res.json(results);
    });
  }
);

router.get(
  "/customers",
  authenticateAdminToken,
  async (req: Request, res: Response) => {
    db.query(
      `SELECT * from user JOIN role ON user.Role_role_id=role.role_id WHERE role.name = "customer"`,
      null,
      (err: MysqlError, results) => {
        if (err) return res.status(500).json({ error: "server error" });
        if (results.length === 0) res.status(404).json({ error: "empty" });
        return res.json(results);
      }
    );
  }
);

export default router;
