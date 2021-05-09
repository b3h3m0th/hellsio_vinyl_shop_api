import * as express from "express";
import { Request, Response } from "express";
import { RedisError } from "redis";
import authenticateAdminToken from "../../authorization/admin";
import redisClient, { redisHellsioPrefix } from "../../redis";
const router = express.Router();

router.post(
  "/edit",
  authenticateAdminToken,
  (req: Request & { key: string; value: string }, res: Response) => {
    redisClient.set(
      `${redisHellsioPrefix}${req.key}`,
      req.value,
      (err: RedisError) => {
        if (err) return res.sendStatus(500);
        else return res.sendStatus(200);
      }
    );
  }
);

router.get(
  "/value",
  authenticateAdminToken,
  (req: Request & { key: string }, res: Response) => {
    return res.send(redisClient.get(`${redisHellsioPrefix}${req.key}`));
  }
);

export default router;
