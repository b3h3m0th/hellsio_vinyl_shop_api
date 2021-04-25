import { NextFunction, Request, Response } from "express";

export class StripeToken {
  public static stripeTokens: Array<any> = [];

  public static push(stripeToken: string) {
    this.stripeTokens.push(stripeToken);
  }
}

export const authenticateStripeToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["stripe-authorization"];
  if (!token) return res.sendStatus(401);

  console.log(token, StripeToken.stripeTokens);

  if (!StripeToken.stripeTokens.includes(token)) return res.sendStatus(403);
  else next();
};
