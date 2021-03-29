//.env
import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
const app = express();
import database from "./database";

import authRoute from "./routes/user";
import mainRoute from "./routes/main";
import adminRoute from "./routes/admin";

// database.connection = database.connect({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_DATABASE,
// });

app.use(cors());
app.use(express.json());

const base = "api";

//routes
app.use(`/${base}`, mainRoute);
app.use(`/${base}/user`, authRoute);
app.use(`${base}/admin`, adminRoute);

app.get("/", (req: Request, res: Response) => {
  res.json({ api: "Hellsio API" });
});

app.listen(process.env.PORT, () => console.log(`Hellsio API online!`));
