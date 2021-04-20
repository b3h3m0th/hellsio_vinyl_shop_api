import * as express from "express";
import { Request, Response } from "express";
import { MysqlError } from "mysql";
import authenticateAdminToken from "../authorization/admin";
import db from "../database";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  db.query(`SELECT * FROM album`, null, (err: MysqlError, results) => {
    if (err) return res.status(500).json({ error: "server error" });
    if (results.length === 0) res.status(404).json({ error: "empty" });
    return res.send(results);
  });
});

router.get("/format", (req: Request, res: Response) => {
  db.query(`SELECT * FROM format`, null, (err: MysqlError, results) => {
    if (err) return res.status(500).json({ error: "server error" });
    if (results.length === 0) res.status(404).json({ error: "empty" });
    return res.send(results);
  });
});

router.get("/:code", (req: Request, res: Response) => {
  let album: any;
  db.query(
    `SELECT *, album.name as name, artist.name as artist, format.name as format FROM album JOIN artist ON album.Artist_artist_id=artist.artist_id JOIN format ON format.format_id=album.Format_format_id WHERE code = ?`,
    [req.params.code],
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) return res.status(404).json({ error: "empty" });
      album = results[0];

      db.query(
        `SELECT * FROM track LEFT JOIN album ON track.Album_album_id=album.album_id WHERE code = ?`,
        [req.params.code],
        (err: MysqlError, results) => {
          if (err) return res.status(500).json({ error: "server error" });
          if (results.length === 0)
            return res.status(404).json({ error: "empty" });

          album.tracks = results;
          return res.send(album);
        }
      );
    }
  );
});

router.get("/few/:amount", (req: Request, res: Response) => {
  let result: Array<any> = [];
  db.query(
    `SELECT *, album.name as name, artist.name as artist FROM album JOIN artist ON album.Artist_artist_id=artist.artist_id LIMIT ?`,
    [+req.params.amount],
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) res.status(404).json({ error: "empty" });
      return res.send(results);
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
