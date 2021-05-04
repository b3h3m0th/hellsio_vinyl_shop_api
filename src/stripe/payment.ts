import { Request, Response } from "express";
import { MysqlError } from "mysql";
import db from "../database";
import * as countries from "i18n-iso-countries";
import Stripe from "stripe";
import { StripeToken } from "../authorization/stripe";
import { sendInvoiceEmail } from "../invoice/invoice";

export class InvoiceHandover {
  public static invoice_id: number;
}

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
          `INSERT INTO invoice (invoice_id, date, total, User_user_id, Status_status_id) VALUES (NULL, NULL, ?, ?, ?)`,
          [calculateAmount(products) / 100, req.user.user_id, 1],
          (err: MysqlError, results) => {
            if (err) return res.sendStatus(500);

            StripeToken.add(paymentIntent.client_secret, results.insertId);
            InvoiceHandover.invoice_id = results.insertId;
            return res.send({
              clientSecret: paymentIntent.client_secret,
            });
          }
        );
      })();
    }
  );

export const completeCheckout = (req: Request & any, res: Response) => {
  db.query(
    `INSERT INTO country (country_id, name, iso_code) VALUES (NULL, ?, ?) ON DUPLICATE KEY UPDATE country_id=LAST_INSERT_ID(country_id)`,
    [
      req.body.billingData.country,
      countries.getAlpha3Code(req.body.billingData.country, "en"),
      req.body.billingData.country,
      countries.getAlpha3Code(req.body.billingData.country, "en"),
    ],
    (err: MysqlError, results, fields) => {
      if (err) return res.sendStatus(503);

      db.query(
        `INSERT INTO location (location_id, postal_code, city, state, Country_country_id) VALUES (NULL, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE location_id=LAST_INSERT_ID(location_id);`,
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
            `UPDATE user SET firstname = ?, lastname = ?, birthdate = ?, street = ?, street_number = ?, Location_location_id = ? WHERE email = ?;`,
            [
              req.body.billingData.firstname,
              req.body.billingData.lastname,
              req.body.billingData.birthdate,
              req.body.billingData.street,
              req.body.billingData.street_number,
              results.insertId,
              req.user.email,
            ],
            (err: MysqlError, results) => {
              if (err) return res.sendStatus(505);

              db.query(
                `SELECT album_id FROM album WHERE album.code IN (?)`,
                [req.body.billingData.products.map((p: any) => p.code)],
                (err: MysqlError, results) => {
                  if (err) return res.sendStatus(505);

                  db.query(
                    `INSERT INTO invoiceline (invoiceline_id, quantity, Invoice_invoice_id, Album_album_id) VALUES ?`,
                    [
                      req.body.billingData.products.map((p: any, i: number) => {
                        return [
                          null,
                          p.quantity,
                          InvoiceHandover.invoice_id,
                          results[i].album_id,
                        ];
                      }),
                    ],
                    (err: MysqlError, results, fields) => {
                      if (err) return res.sendStatus(506);

                      db.query(
                        `SELECT invoice.invoice_id, invoice.date, invoice.total, status.text as status, album.code, invoiceline.quantity, user.firstname, user.lastname, user.email, user.street, user.street_number, location.postal_code, location.city, country.name as country_name FROM invoice JOIN invoiceline ON invoiceline.Invoice_invoice_id=invoice.invoice_id JOIN album ON invoiceline.Album_album_id=album.album_id JOIN user ON invoice.User_user_id=user.user_id JOIN location ON user.Location_location_id=location.location_id JOIN country ON location.Country_country_id=country.country_id JOIN status ON invoice.Status_status_id=status.status_id WHERE invoice.invoice_id = ?;`,
                        [InvoiceHandover.invoice_id],
                        (err: MysqlError, results) => {
                          if (err) return res.sendStatus(500);

                          sendInvoiceEmail(req.user.email, results);

                          return res.status(200).send("payment successful!");
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
