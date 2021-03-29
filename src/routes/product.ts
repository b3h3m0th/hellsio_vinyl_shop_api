import * as express from "express";
import { Request, Response } from "express";
import authenticateAdmin from "../authorization/admin";
const router = express.Router();

router.get("/", authenticateAdmin, (req: Request, res: Response) => {
  return res.send("Welcome to Hellsio vinyl shop admin shop endpoint");
});

router.post("/add", authenticateAdmin, (req: Request, res: Response) => {
  res.json({ add: "add" });
});

router.put("/edit/:id", authenticateAdmin, (req: Request, res: Response) => {
  res.json({ edit: "edit" });
});

router.delete(
  "/delete/:id",
  authenticateAdmin,
  (req: Request, res: Response) => {
    res.json({ delete: "delete" });
  }
);

export default router;
