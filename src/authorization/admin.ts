import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

const authenticateAdminToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
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

export default authenticateAdminToken;
