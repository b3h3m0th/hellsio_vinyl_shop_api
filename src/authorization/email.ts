import { MysqlError } from "mysql";
import * as nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
require("handlebars-helpers")();
import { v4 as uuidv4 } from "uuid";
import db from "../database";
import * as hbs from "nodemailer-express-handlebars";
import * as path from "path";

export const sendVerificationEmail: (to: string) => void = (to) => {
  const emailToken = uuidv4();
  const verifyEmailURL = `${process.env.BACKEND_BASE_URL}/user/verify-email/${emailToken}`;

  db.query(
    `SELECT user_id FROM user WHERE user.email = ?;`,
    [to],
    (err: MysqlError, results) => {
      if (err) return;

      db.query(
        `INSERT INTO emailtoken (emailtoken_id, token, User_user_id) VALUES (NULL, ?, ?) ON DUPLICATE KEY UPDATE emailtoken_id=LAST_INSERT_ID(emailtoken_id), token=?;`,
        [emailToken, results[0].user_id, emailToken],
        (err: MysqlError, results) => {
          if (err) return console.log(err);

          (async () => {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              host: "smtp.gmail.com",
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
              },
            });

            transporter.use(
              "compile",
              hbs({
                viewEngine: {
                  engine: "express-handlebars" as any,
                  defaultLayout: false,
                } as any,
                viewPath: path.resolve(__dirname, "views"),
              })
            );

            await transporter.sendMail({
              from: `\"Hellsio - Customer Service\" <${process.env.GMAIL_USER}>`,
              to: to,
              subject: "Hellsio - Verify Email",
              template: "email_verification",
              context: {
                verificationURL: verifyEmailURL,
              },
            } as any & Mail.Options);
          })();
        }
      );
    }
  );
};
