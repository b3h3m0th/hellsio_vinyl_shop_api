import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  res.json({ endpoint: "user/register" });
});

router.post("/login", async (req: Request, res: Response) => {
  //authenticate user with database

  res.json({ endpoint: "user/login" });
});

export default router;
