import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import generateAccessToken from "../authorization/token";
import authenticateUserToken from "../authorization/user";

//do this in database!
let refreshTokens: Array<any> = [];

router.get("/", authenticateUserToken, async (req: Request, res: Response) => {
  return res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  return res.json({ endpoint: "user/register" });
});

router.post("/login", async (req: Request, res: Response) => {
  //authenticate user with database
  if (
    req.body.email !== "simonostini@gmail.com" ||
    !bcrypt.compareSync(
      req.body.password,
      bcrypt.hashSync(process.env.SIMON_USER_PASSWORD, 10)
    )
  )
    return res.sendStatus(403);

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
