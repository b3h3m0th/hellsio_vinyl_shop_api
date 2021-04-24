import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";

const authenticateUserToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  console.log(token);

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

export default authenticateUserToken;
