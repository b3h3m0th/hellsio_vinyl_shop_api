import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import * as jwt from "jsonwebtoken";
import authenticateUserToken from "../authorization/user";

router.get("/", async (req: Request, res: Response) => {
  return res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  return res.json({ endpoint: "user/register" });
});

router.post("/login", async (req: Request, res: Response) => {
  //authenticate user with database
  const user = { username: "Simon" };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  return res.json({ accessToken: accessToken });
});

router.post(
  "/checkout",
  authenticateUserToken,
  async (req: Request, res: Response) => {
    return res.send("checkout");
  }
);

export default router;
