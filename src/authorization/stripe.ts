import { NextFunction, Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../database";

export class StripeToken {
  public static add: (token: string, invoiceId) => void = (
    token: string,
    invoiceId
  ) => {
    db.query(
      `REPLACE INTO stripetoken (stripe_token_id, token, Invoice_invoice_id) VALUES (NULL, ?, ?);`,
      [token, invoiceId],
      (err: MysqlError) => {
        if (err) return console.log(err);
      }
    );
  };

  public static includes: (refreshToken: string) => boolean = (
    refreshToken: string
  ) => {
    const result = db.query(
      `SELECT token from stripetoken;`,
      null,
      (err: MysqlError, results, fields) => {
        if (err) return console.log(err);
        return [...results.map(({ token }) => token)].includes(refreshToken);
      }
    );
    return true;
  };

  public static remove: (token: string) => void = (token: string) => {
    return db.query(
      `DELETE FROM stripetoken WHERE token = ?;`,
      [token],
      (err: MysqlError) => {
        if (err) return console.log(err);
      }
    );
  };
}

export const authenticateStripeToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string = req.headers["stripe-authorization"] as string;
  if (!token) return res.sendStatus(401);

  if (!StripeToken.includes(token)) return res.sendStatus(407);
  else next();
};
