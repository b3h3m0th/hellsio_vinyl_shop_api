import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../database";
import * as countries from "i18n-iso-countries";
import Stripe from "stripe";
import { StripeToken } from "../authorization/stripe";

export const completeCheckout = (req: Request & any, res: Response) => {
  console.log(req.body.billingData);
  db.query(
    `INSERT INTO country (country_id, name, iso_code) VALUES (NULL, ?, ?) ON DUPLICATE KEY UPDATE country_id=LAST_INSERT_ID(country_id), name = ?, iso_code = ?`,
    [
      req.body.billingData.country,
      countries.getAlpha3Code(req.body.billingData.country, "en"),
      req.body.billingData.country,
      countries.getAlpha3Code(req.body.billingData.country, "en"),
    ],
    (err: MysqlError, results, fields) => {
      if (err) return res.sendStatus(503);

      db.query(
        `INSERT INTO location (location_id, postal_code, city, state, Country_country_id) VALUES (NULL, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE location_id=LAST_INSERT_ID(location_id), postal_code = ?, city = ?, state = ?, Country_country_id = ?`,
        [
          req.body.billingData.postal_code,
          req.body.billingData.city,
          req.body.billingData.state,
          results.insertId,
          req.body.billingData.postal_code,
          req.body.billingData.city,
          req.body.billingData.state,
          results.insertId,
        ],
        (err: MysqlError, results, fields) => {
          if (err) return res.sendStatus(504);

          db.query(
            `UPDATE user SET firstname = ?, lastname = ?, birthdate = ?, street = ?, street_number = ? WHERE email = ?`,
            [
              req.body.billingData.firstname,
              req.body.billingData.lastname,
              req.body.billingData.birthdate,
              req.body.billingData.street,
              req.body.billingData.steet_number,
              req.body.billingData.email,
            ],
            (err: MysqlError, results) => {
              if (err) console.log(err);

              //insert products to invoiceline

              //confirm payment
              return res.status(201).send("payment successful!");
            }
          );
        }
      );
    }
  );
};

export const completeCreatePaymentIntent = (
  req: Request & any,
  res: Response,
  stripe: Stripe
) =>
  db.query(
    `SELECT * FROM album WHERE album.code IN (?)`,
    [req.body.billingData.products.map((p: any) => p.code)],
    (err: MysqlError, results) => {
      if (err) return res.sendStatus(500);

      const products = results.map((p: any, i: number) => {
        return { ...p, ...req.body.billingData.products[i] };
      });

      (async () => {
        const calculateAmount = (products: any[]) => {
          return Math.round(
            products
              .map((p: any, _: number) => p)
              .reduce((total: number, current) => {
                return current.price * current.quantity + total;
              }, 0) * 100
          );
        };

        const paymentIntent = await stripe.paymentIntents.create({
          currency: "eur",
          amount: calculateAmount(products),
          description: JSON.stringify(req.body.billingData),
          receipt_email: req.user.email,
        } as Stripe.PaymentIntentCreateParams);

        db.query(
          `INSERT INTO invoice (invoice_id, date, total, User_user_id) VALUES (NULL, NULL, ?, ?)`,
          [calculateAmount(products) / 100, req.user.user_id],
          (err: MysqlError, results) => {
            if (err) return res.sendStatus(500);

            StripeToken.add(paymentIntent.client_secret, results.insertId);
            return res.send({
              clientSecret: paymentIntent.client_secret,
            });
          }
        );
      })();
    }
  );
