import * as nodemailer from "nodemailer";
import * as hbs from "nodemailer-express-handlebars";
import Mail from "nodemailer/lib/mailer";
import * as path from "path";

export const sendInvoiceEmail: (to: string) => void = (to) => {
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
      from: "simonostini@gmail.com",
      to: to,
      subject: "Hellsio - Order Confirmation",
      text: "Hello world?",
      template: "index",
    } as any & Mail.Options);
  })();
};
