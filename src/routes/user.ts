import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import * as jwt from "jsonwebtoken";
import generateAccessToken from "../authorization/token";
import authenticateUserToken from "../authorization/user";

//do this in database!
let refreshTokens = [];

router.get("/", async (req: Request, res: Response) => {
  return res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  return res.json({ endpoint: "user/register" });
});

router.post("/login", async (req: Request, res: Response) => {
  //authenticate user with database
  const user = { username: "Simon" };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

router.post("/token", async (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (!refreshTokens) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: jwt.JsonWebTokenError, user: any) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken({ name: user.name });
      return res.json({ accessToken: accessToken });
    }
  );
});

router.post(
  "/checkout",
  authenticateUserToken,
  async (req: Request, res: Response) => {
    return res.send("checkout");
  }
);

export default router;
