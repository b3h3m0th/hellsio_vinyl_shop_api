//.env
import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
const app = express();
import db from "./database";

import authRoute from "./routes/user";
import mainRoute from "./routes/main";
import adminRoute from "./routes/admin";
import productRoute from "./routes/product";

app.use(cors("*"));
app.use(express.json());

const base = "api";

//routes
app.use(`/${base}`, mainRoute);
app.use(`/${base}/user`, authRoute);
app.use(`/${base}/admin`, adminRoute);
app.use(`/${base}/product`, productRoute);

app.get("/", (req: Request, res: Response) => {
  res.redirect(`/${base}`);
});

app.listen(process.env.PORT, () =>
  console.log(`Hellsio API online on Port ${process.env.PORT}!`)
);
