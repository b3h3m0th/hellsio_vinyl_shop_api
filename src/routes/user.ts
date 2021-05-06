import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { generateAccessToken } from "../authorization/token";
import authenticateUserToken, { isEmailVerified } from "../authorization/user";
import db from "../database";
import { MysqlError } from "mysql";
import { RefreshTokens } from "../authorization/token";
import Stripe from "stripe";
import { authenticateStripeToken, StripeToken } from "../authorization/stripe";
import {
  completeCheckout,
  completeCreatePaymentIntent,
} from "../stripe/payment";
import { sendVerificationEmail } from "../authorization/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

router.get("/", authenticateUserToken, async (req: Request, res: Response) => {
  return res.json({ endpoint: "user" });
});

router.post("/register", async (req: Request, res: Response) => {
  if (req.body.username.includes("@"))
    return res.status(406).json({ error: "Your username mustn't include '@'" });

  const hashedPassword: string = bcrypt.hashSync(req.body.password, 10);

  db.query(
    `INSERT INTO user (user_id, firstname, lastname, username, email, email_verified, phone, password, birthdate, street, street_number, Role_role_id, Location_location_id) VALUES (NULL, NULL, NULL, '${req.body.username}', '${req.body.email}', 0, NULL, '${hashedPassword}', NULL, NULL, NULL, '2', '1');`,
    null,
    (err: MysqlError, results, fields) => {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(406)
          .json({ error: "This username/email is already taken" });
      } else if (err) {
        return res
          .status(406)
          .json({ error: "An error occured while registering you" });
      }

      sendVerificationEmail(req.body.email);

      return res.sendStatus(204);
    }
  );
});

router.post("/login", async (req: Request, res: Response) => {
  const incommingUser: { email: string; password: string } = {
    email: req.body.email,
    password: req.body.password,
  };

  //separate username/email
  if (incommingUser.email.includes("@")) {
    db.query(
      `SELECT user_id, password FROM user WHERE email = ?`,
      [incommingUser.email],
      (err: MysqlError, results) => {
        if (err)
          return res
            .status(406)
            .json({ error: "An error occured while registering you" });
        else if (results.length === 0) {
          return res.status(406).json({ error: "Wrong email or password" });
        }

        if (!bcrypt.compareSync(incommingUser.password, results[0].password)) {
          return res
            .status(406)
            .json({ error: "Wrong email/username or password" });
        } else {
          const userToSign = { email: req.body.email };

          const accessToken = generateAccessToken(userToSign);
          const refreshToken = jwt.sign(
            userToSign,
            process.env.REFRESH_TOKEN_SECRET
          );

          RefreshTokens.add(refreshToken, results[0].user_id);

          return res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        }
      }
    );
  } else {
    db.query(
      `SELECT user_id, password FROM user WHERE username = ?`,
      [incommingUser.email],
      (err: MysqlError, results) => {
        if (err)
          return res
            .status(406)
            .json({ error: "An error occured while registering you" });
        else if (results.length === 0) {
          return res.status(406).json({ error: "Wrong username or password" });
        }

        if (!bcrypt.compareSync(incommingUser.password, results[0].password)) {
          return res
            .status(406)
            .json({ error: "Wrong email/username or password" });
        } else {
          const userToSign = { email: req.body.email };

          const accessToken = generateAccessToken(userToSign);
          const refreshToken = jwt.sign(
            userToSign,
            process.env.REFRESH_TOKEN_SECRET
          );

          RefreshTokens.add(refreshToken, results[0].user_id);

          return res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        }
      }
    );
  }
});

router.post("/token", async (req: Request, res: Response) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!RefreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: jwt.JsonWebTokenError, user: any) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken({ email: user.email });
      return res.json({ accessToken: accessToken });
    }
  );
});

router.get("/verify-email/:emailtoken", async (req: Request, res: Response) => {
  db.query(
    `UPDATE user JOIN emailtoken ON user.user_id=emailtoken.User_user_id SET user.email_verified=1 WHERE emailtoken.token = ?;`,
    [req.params.emailtoken],
    (err: MysqlError, results) => {
      if (err) return res.send(500);
      if (results.length === 0) return res.status(404).json({ error: "empty" });

      return res.redirect(`${process.env.FRONTEND_BASE_URL}/email-verified`);
    }
  );
});

router.delete("/logout", async (req: Request, res: Response) => {
  if (req.headers["token"])
    RefreshTokens.remove(req.headers["token"].toString());
  return res.sendStatus(204);
});

// payments

router.post(
  "/create-payment-intent",
  authenticateUserToken,
  (req: Request & { user: any }, res: Response) => {
    if (!req.user.email.includes("@")) {
      db.query(
        `SELECT email, user_id FROM user WHERE username = ?`,
        [req.user.email],
        (err: MysqlError, results) => {
          if (err) return res.sendStatus(500);

          req.user.email = results[0].email;
          req.user.user_id = results[0].user_id;

          if (!isEmailVerified(req.user.email)) return res.sendStatus(208);

          completeCreatePaymentIntent(req, res, stripe);
        }
      );
    } else {
      db.query(
        `SELECT user_id FROM user WHERE email = ?`,
        [req.user.email],
        (err: MysqlError, results) => {
          if (err) return res.sendStatus(500);

          req.user.user_id = results[0].user_id;

          if (!isEmailVerified(req.user.email)) return res.sendStatus(208);

          completeCreatePaymentIntent(req, res, stripe);
        }
      );
    }
  }
);

router.post(
  "/checkout",
  authenticateUserToken,
  authenticateStripeToken,
  async (req: Request & { user: any }, res: Response) => {
    if (!req.user.email.includes("@")) {
      db.query(
        `SELECT user_id, email FROM user WHERE username = ?`,
        [req.user.email],
        (err: MysqlError, results) => {
          if (err) res.sendStatus(501);

          req.user.email = results[0].email;
          req.user.user_id = results[0].user_id;

          completeCheckout(req, res);
        }
      );
    } else {
      db.query(
        `SELECT user_id FROM user WHERE email = ?`,
        [req.user.email],
        (err: MysqlError, results) => {
          if (err) return res.sendStatus(502);

          req.user.user_id = results[0].user_id;

          completeCheckout(req, res);
        }
      );
    }
  }
);

export default router;
