import * as jwt from "jsonwebtoken";

const generateAccessToken: (user: any) => string = (user: any) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10s" });
};

export default generateAccessToken;
