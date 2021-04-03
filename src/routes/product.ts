import * as express from "express";
import { Request, Response } from "express";
import authenticateAdminToken from "../authorization/admin";
const router = express.Router();

router.get("/", authenticateAdminToken, (req: Request, res: Response) => {
  return res.send("Welcome to Hellsio vinyl shop admin shop endpoint");
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
