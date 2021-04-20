import * as express from "express";
import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../database";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  db.query(`SELECT * FROM genre`, null, (err: MysqlError, results) => {
    if (err) return res.status(500).json({ error: "server error" });
    if (results.length === 0) res.status(404).json({ error: "empty" });
    return res.send(results);
  });
});

export default router;
