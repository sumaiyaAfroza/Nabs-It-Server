
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

/* middleware */
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@urmi-project.bsifax9.mongodb.net/?appName=urmi-project`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const noticeCollection = client.db("noticeDB").collection("notices");

    console.log("MongoDB Connected Successfully 🚀");

   

  } catch (error) {
    console.log(error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Notice Server Running ✅");
});

app.listen(port, () => {
  console.log('server ok', port);
});
