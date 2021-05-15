import * as express from "express";
import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../../database";
const router = express.Router();

router.get("/new-arrivals", (req: Request, res: Response) => {
  db.query(
    `SELECT artist.name AS artist, album.name, album.code FROM album JOIN artist ON album.Artist_artist_id=artist.artist_id ORDER BY album.added_date DESC LIMIT ?;`,
    [+req.query.limit],
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) return res.status(404).json({ error: "empty" });
      return res.send(results);
    }
  );
});

router.get("/featured", (req: Request, res: Response) => {
  db.query(
    `SELECT artist.name AS artist, album.name, album.code FROM album JOIN artist ON album.Artist_artist_id=artist.artist_id LIMIT ?;`,
    [+req.query.limit],
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) return res.status(404).json({ error: "empty" });
      return res.send(results);
    }
  );
});

router.get("/popular", (req: Request, res: Response) => {
  db.query(
    `SELECT artist.name AS artist, album.name AS name, album.code, COUNT(invoiceline.Album_album_id) as popularity FROM album JOIN artist ON album.Artist_artist_id=artist.artist_id JOIN invoiceline ON invoiceline.Album_album_id=album.album_id GROUP BY invoiceline.Album_album_id ORDER BY popularity DESC LIMIT ?;`,
    [+req.query.limit],
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "server error" });
      if (results.length === 0) return res.status(404).json({ error: "empty" });
      return res.send(results);
    }
  );
});

export default router;
