import * as jwt from "jsonwebtoken";

const generateAccessToken = (user: any) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
};

export default generateAccessToken;
