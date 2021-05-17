import * as express from "express";
import { Request, Response } from "express";
import { MysqlError } from "mysql";
const router = express.Router();
import authenticateUserToken from "../authorization/user";
import db from "../database";

router.post(
  "/rate",
  authenticateUserToken,
  async (req: Request & { user: any }, res: Response) => {
    if (!req.user.email.includes("@")) {
      db.query(
        `INSERT INTO rating (rating_id, value, Album_album_id, User_user_id) VALUES (NULL, ?, (SELECT album.album_id FROM album WHERE album.code = ?), (SELECT user.user_id FROM user WHERE user.username = ?)) ON DUPLICATE KEY UPDATE rating.rating_id=LAST_INSERT_ID(rating.rating_id), value = ?;`,
        [+req.body.value, req.body.album_code, req.user.email, +req.body.value],
        (err: MysqlError) => {
          if (err) return res.sendStatus(500);
          return res.sendStatus(201);
        }
      );
    } else {
      db.query(
        `INSERT INTO rating (rating_id, value, Album_album_id, User_user_id) VALUES (NULL, ?, (SELECT album.album_id FROM album WHERE album.code = ?), (SELECT user.user_id FROM user WHERE user.email = ?)) ON DUPLICATE KEY UPDATE rating.rating_id=LAST_INSERT_ID(rating.rating_id), value = ?;`,
        [+req.body.value, req.body.album_code, req.user.email, +req.body.value],
        (err: MysqlError) => {
          if (err) return res.sendStatus(500);
          return res.sendStatus(201);
        }
      );
    }
  }
);

router.get("/:code", (req: Request, res: Response) => {
  if (!req.params.code || +req.params.code > 5 || +req.params.code < 1)
    return res.sendStatus(403);

  db.query(
    `SELECT album.code, AVG(rating.value) as average, COUNT(rating.rating_id) as ratings_count FROM rating JOIN album ON album.album_id=rating.Album_album_id WHERE album.code = ?;`,
    [req.params.code],
    (err: MysqlError, results) => {
      if (err) return res.sendStatus(500);
      return res.send(results[0]);
    }
  );
});

export default router;
