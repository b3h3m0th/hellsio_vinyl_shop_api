//.env
import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import * as morgan from "morgan";
const app = express();

import authRoute from "./routes/user";
import mainRoute from "./routes/main";
import adminRoute from "./routes/admin";
import productRoute from "./routes/product";
import genreRoute from "./routes/genre";
import ratingRoute from "./routes/rating";

app.use(cors("*"));
app.use(morgan("dev"));
app.use(express.json());

const base = "api" as const;

//routes
app.use(`/${base}`, mainRoute);
app.use(`/${base}/user`, authRoute);
app.use(`/${base}/admin`, adminRoute);
app.use(`/${base}/product`, productRoute);
app.use(`/${base}/genre`, genreRoute);
app.use(`/${base}/rating`, ratingRoute);

app.get("/", (req: Request, res: Response) => {
  res.redirect(`/${base}`);
});

app.listen(process.env.PORT, () =>
  console.log(`Hellsio API online on Port ${process.env.PORT}!`)
);
