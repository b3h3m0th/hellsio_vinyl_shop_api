import * as express from "express";
import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import generateAccessToken from "../authorization/token";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  return res.send("Welcome to Hellsio vinyl shop admin endpoint");
});

router.post("/login", async (req: Request, res: Response) => {});

router.get("/token", (req: Request, res: Response) => {
  return res.send("!");
});

export default router;
