import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import generateAccessToken from "../authorization/token";
import authenticateUserToken from "../authorization/user";
import db from "../database";
import { MysqlError } from "mysql";

//do this in database!
let refreshTokens: Array<any> = [];

router.get("/", authenticateUserToken, async (req: Request, res: Response) => {
  return res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  if (req.body.username.includes("@"))
    return res.status(406).json({ error: "Your username mustn't include '@'" });

  const hashedPassword: string = bcrypt.hashSync(req.body.password, 10);

  db.query(
    `INSERT INTO user (user_id, firstname, lastname, username, email, phone, password, birthdate, street, street_number, Role_role_id, Location_location_id) VALUES (NULL, NULL, NULL, '${req.body.username}', '${req.body.email}', NULL, '${hashedPassword}', NULL, NULL, NULL, '2', '1');`,
    null,
    (err: MysqlError, results, fields) => {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(406)
          .json({ error: "This username/email is already taken" });
      } else if (err) {
        return res
          .status(406)
          .json({ error: "An error occured while registering you" });
      }
    }
  );
});

router.post("/login", async (req: Request, res: Response) => {
  const incommingUser: { email: string; password: string } = {
    email: req.body.email,
    password: req.body.password,
  };

  //separate username/email
  if (incommingUser.email.includes("@")) {
    db.query(
      `SELECT password FROM user WHERE email = ?`,
      [incommingUser.email],
      (err: MysqlError, results) => {
        if (err)
          return res
            .status(406)
            .json({ error: "An error occured while registering you" });
        else if (!results) {
          return res.status(406).json({ error: "Wrong email or password" });
        }

        console.log(incommingUser.password, results[0].password);
        console.log(
          bcrypt.compareSync(incommingUser.password, results[0].password)
        );

        if (!bcrypt.compareSync(incommingUser.password, results[0].password)) {
          return res
            .status(406)
            .json({ error: "Wrong email/username or password" });
        } else {
          const userToSign = { email: req.body.email };

          const accessToken = generateAccessToken(userToSign);
          const refreshToken = jwt.sign(
            userToSign,
            process.env.REFRESH_TOKEN_SECRET
          );
          refreshTokens.push(refreshToken);
          return res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        }
      }
    );
  } else {
    db.query(
      `SELECT password FROM user WHERE username = ?`,
      [incommingUser.email],
      (err: MysqlError, results) => {
        if (err)
          return res
            .status(406)
            .json({ error: "An error occured while registering you" });
        else if (!results) {
          return res.status(406).json({ error: "Wrong username or password" });
        }

        console.log(incommingUser.password, results[0].password);
        console.log(
          bcrypt.compareSync(incommingUser.password, results[0].password)
        );

        if (!bcrypt.compareSync(incommingUser.password, results[0].password)) {
          return res
            .status(406)
            .json({ error: "Wrong email/username or password" });
        } else {
          const userToSign = { email: req.body.email };

          const accessToken = generateAccessToken(userToSign);
          const refreshToken = jwt.sign(
            userToSign,
            process.env.REFRESH_TOKEN_SECRET
          );
          refreshTokens.push(refreshToken);
          return res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        }
      }
    );
  }
});

router.post("/token", async (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: jwt.JsonWebTokenError, user: any) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken({ email: user.email });
      return res.json({ accessToken: accessToken });
    }
  );
});

router.delete("/logout", async (req: Request, res: Response) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  return res.sendStatus(204);
});

router.post(
  "/checkout",
  authenticateUserToken,
  async (req: Request, res: Response) => {
    return res.send("checkout");
  }
);

export default router;
