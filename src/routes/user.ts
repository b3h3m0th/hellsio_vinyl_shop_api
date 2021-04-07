import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import generateAccessToken from "../authorization/token";
import authenticateUserToken from "../authorization/user";
import db from "../database";

//do this in database!
let refreshTokens: Array<any> = [];

router.get("/", authenticateUserToken, async (req: Request, res: Response) => {
  return res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  db.query(
    `INSERT INTO user (user_id, firstname, lastname, username, email, phone, password, birthdate, street, street_number, Role_role_id, Location_location_id) VALUES (NULL, NULL, NULL, '${
      req.body.username
    }', '${req.body.email}', NULL, '${bcrypt.hashSync(
      req.body.password,
      bcrypt.genSaltSync(10)
    )}', NULL, NULL, NULL, '2', '1');`,
    null,
    (err, results, fields) => {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(406)
          .json({ error: "This username/email is already taken" });
      } else if (err) {
        return res
          .status(406)
          .json({ error: "An error occured while logging you in" });
      }
    }
  );
});

router.post("/login", async (req: Request, res: Response) => {
  let userHash: string;
  let userInDB: any = null;

  db.query(
    `SELECT password from user WHERE ${
      req.body.email.includes("@")
        ? `email="${req.body.email}"`
        : `username="${req.body.email}"`
    };`,
    null,
    (err, results, fields) => {
      console.log("error: ", err);
      console.log("results: ", results);
      console.log("fields: ", fields);
      userHash = results.RowDataPacket.password;
      if (err) {
        return res
          .status(406)
          .json({ error: "Sorry, an error occured when logging you in" });
      }
    }
  );

  console.log("userHash: ", userHash);

  db.query(
    `SELECT * from user WHERE ${
      req.body.email.includes("@")
        ? `email="${req.body.email}"`
        : `username="${req.body.email}"`
    } && password="${bcrypt.compareSync(req.body.password, userHash)}";`,
    null,
    (err, results, fields) => {
      console.log(results);
      if (err || !fields) {
        return res.status(406).json({ error: "Wrong username or password" });
      }
    }
  );

  //authenticate user with database
  // if (
  //   req.body.email !== "simonostini@gmail.com" ||
  //   !bcrypt.compareSync(
  //     req.body.password,
  //     bcrypt.hashSync(process.env.SIMON_USER_PASSWORD, 10)
  //   )
  // )
  //   return res.sendStatus(403);

  const user = { email: req.body.email };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return res.json({ accessToken: accessToken, refreshToken: refreshToken });
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
