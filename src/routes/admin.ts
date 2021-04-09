import * as express from "express";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { generateAccessToken } from "../authorization/token";
import * as bcrypt from "bcrypt";
import authenticateAdminToken from "../authorization/admin";
const router = express.Router();

//do this in database!
let refreshTokens: Array<any> = [];

router.get("/", authenticateAdminToken, (req: Request, res: Response) => {
  return res.send("Welcome to Hellsio vinyl shop admin endpoint");
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

      const accessToken = generateAccessToken({ username: user.username });
      return res.json({ accessToken: accessToken });
    }
  );
});

router.post("/login", async (req: Request, res: Response) => {
  //authenticate user with database
  if (
    req.body.username !== "admin" ||
    !bcrypt.compareSync(
      req.body.password,
      bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
    )
  )
    return res.sendStatus(403);

  const user = { username: req.body.username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

router.delete("/logout", async (req: Request, res: Response) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
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
    return res.json({ endpoint: "products" });
  }
);

router.get(
  "/customers",
  authenticateAdminToken,
  async (req: Request, res: Response) => {
    return res.json({ endpoint: "customers" });
  }
);

export default router;
