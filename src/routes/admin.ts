import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  return res.send("Welcome to Hellsio vinyl shop admin endpoint");
});

export default router;
