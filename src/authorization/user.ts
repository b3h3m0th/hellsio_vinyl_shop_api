import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import { MysqlError } from "mysql";
import db from "../database";

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

export const isEmailVerified = (email: string) => {
  let email_verified: boolean = false;

  db.query(
    `SELECT user.email_verified FROM user WHERE user.email = ?;`,
    [email],
    (err: MysqlError, results) => {
      if (err) return false;
      email_verified = results[0].email_verified as boolean;
    }
  );

  return setTimeout(() => {
    return email_verified;
  }, 100);
};

export default authenticateUserToken;
