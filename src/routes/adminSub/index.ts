import * as express from "express";
import { Request, Response } from "express";
import { RedisError } from "redis";
import authenticateAdminToken from "../../authorization/admin";
import redisClient, { redisHellsioPrefix } from "../../redis";
const router = express.Router();

router.post("/edit", authenticateAdminToken, (req: Request, res: Response) => {
  redisClient.set(
    `${redisHellsioPrefix}${req.body.key}`,
    req.body.value,
    (err: RedisError) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      } else return res.sendStatus(200);
    }
  );
});

router.get("/value", authenticateAdminToken, (req: Request, res: Response) => {
  redisClient.get(
    `${redisHellsioPrefix}${req.headers["key"]}`,
    (err: RedisError, reply) => {
      if (err) return res.sendStatus(500);
      else return res.send(reply);
    }
  );
});

export default router;
