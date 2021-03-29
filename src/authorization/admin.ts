import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
};

export default authenticateAdmin;
