import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { MysqlError } from "mysql";
import db from "../database";
import { sendVerificationEmail } from "./email";

const authenticateUserToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err: jwt.JsonWebTokenError, user: any) => {
      if (err) return res.sendStatus(403);

      req.user = user;
      next();
    }
  );
};

export const isEmailVerified = (
  req: any & Request,
  res: Response & any,
  callback: () => void
) => {
  db.query(
    `SELECT user.email_verified FROM user WHERE user.email = ?;`,
    [req.user.email],
    (err: MysqlError, results) => {
      if (err) return false;
      if (!!!results[0].email_verified) {
        sendVerificationEmail(req.user.email);
        return res.sendStatus(208);
      } else callback();
    }
  );
};

export default authenticateUserToken;
