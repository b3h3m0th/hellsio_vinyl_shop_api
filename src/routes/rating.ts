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
    console.log(req.body);
    if (!req.user.email.includes("@")) {
      db.query(
        `REPLACE INTO rating (rating_id, value, Album_album_id, User_user_id) VALUES (NULL, ?, (SELECT album.album_id FROM album WHERE album.code = ?), (SELECT user.user_id FROM user WHERE user.username = ?));`,
        [+req.body.value, req.body.album_code, req.user.email],
        (err: MysqlError) => {
          if (err) return res.sendStatus(500);
          return res.sendStatus(201);
        }
      );
    } else {
      db.query(
        `REPLACE INTO rating (rating_id, value, Album_album_id, User_user_id) VALUES (NULL, ?, (SELECT album.album_id FROM album WHERE album.code = ?), (SELECT user.user_id FROM user WHERE user.email = ?));`,
        [+req.body.value, req.body.album_code, req.user.email],
        (err: MysqlError) => {
          if (err) return res.sendStatus(500);
          return res.sendStatus(201);
        }
      );
    }
  }
);

export default router;
