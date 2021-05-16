import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import authenticateUserToken, { isEmailVerified } from "../authorization/user";
import db from "../database";

router.post(
  "/rate",
  authenticateUserToken,
  async (req: Request, res: Response) => {
    return res.json({ endpoint: "rating" });
  }
);

export default router;
