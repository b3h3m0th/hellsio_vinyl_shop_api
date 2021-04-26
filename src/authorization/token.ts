import * as jwt from "jsonwebtoken";
import { MysqlError } from "mysql";
import db from "../database";

export const generateAccessToken: (user: any) => string = (user: any) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15min",
  });
};

export class RefreshTokens {
  public static add: (token: string, userId) => void = (
    token: string,
    userId
  ) => {
    db.query(
      `REPLACE INTO refreshtoken (refresh_token_id, token, User_user_id) VALUES (NULL, ?, ?);`,
      [token, userId],
      (err: MysqlError) => {
        if (err) return console.log(err);
      }
    );
  };

  public static includes: (refreshToken: string) => boolean = (
    refreshToken: string
  ) => {
    const result = db.query(
      `SELECT token from refreshtoken;`,
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
      `DELETE FROM refreshtoken WHERE token = ?;`,
      [token],
      (err: MysqlError) => {
        if (err) return console.log(err);
      }
    );
  };
}
