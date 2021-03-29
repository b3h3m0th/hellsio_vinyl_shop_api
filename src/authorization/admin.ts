import { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";

const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const password = req.headers["authorization"];

  if (!password || !bcrypt.compareSync(process.env.ADMIN_PASSWORD, password))
    return res.sendStatus(401);
  next();
};

export default authenticateAdmin;
