import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to Hellsio vinyl shop API");
});

export default router;
