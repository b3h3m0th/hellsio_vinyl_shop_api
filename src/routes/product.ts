import * as express from "express";
import { Request, Response } from "express";
import { MysqlError } from "mysql";
import authenticateAdminToken from "../authorization/admin";
import db from "../database";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  db.query(`SELECT * from album`, null, (err: MysqlError, results, fields) => {
    if (err) return res.status(500).json({ error: "server error" });
    if (results.length === 0) res.status(404).json({ error: "empty" });
    return res.send(results);
  });
});

router.get("/:code", (req: Request, res: Response) => {
  db.query(
    `SELECT * from album WHERE code = ?`,
    [req.params.code],
    (err: MysqlError, results, fields) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) res.status(404).json({ error: "empty" });
      console.log(results[0]);
      return res.send(results[0]);
    }
  );
});

router.post("/add", authenticateAdminToken, (req: Request, res: Response) => {
  res.json({ add: "add" });
});

router.put(
  "/edit/:id",
  authenticateAdminToken,
  (req: Request, res: Response) => {
    res.json({ edit: "edit" });
  }
);

router.delete(
  "/delete/:id",
  authenticateAdminToken,
  (req: Request, res: Response) => {
    res.json({ delete: "delete" });
  }
);

export default router;
