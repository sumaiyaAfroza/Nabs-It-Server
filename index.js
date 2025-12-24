import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: `https://nabs-it-client-bmmc.vercel.app`
}));
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

    const noticeCollection = client
      .db("noticeDB")
      .collection("notices");

    console.log("MongoDB Connected Successfully 🚀");

   app.post("/notice", async (req, res) => {
  try {
    const notice = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await noticeCollection.insertOne(notice);

    res.send({
      success: true,
      message: "Notice published successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to publish notice",
    });
  }
});

app.get("/notice", async (req, res) => {
  try {
    const { status, department, employee, date } = req.query;

    let filter = {};

    // Active / Draft
    if (status === "published") {
      filter.isPublished = true;
    } else if (status === "draft") {
      filter.isPublished = false;
    }

    // Department
    if (department) {
      filter.targetDepartment = department;
    }

    // Employee (id or name)
    if (employee) {
      filter.$or = [
        { employeeId: employee },
        { employeeName: { $regex: employee, $options: "i" } },
      ];
    }

    // Publish date
    if (date) {
      filter.publishDate = date;
    }

    const notices = await noticeCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.send({ success: true, data: notices });
  } catch (error) {
    res.status(500).send({ success: false, data: [] });
  }
});

app.get("/notice/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await noticeCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!notice) {
      return res.status(404).send({
        success: false,
        message: "Notice not found",
      });
    }

    res.send({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch notice",
    });
  }
});


app.get("/notice/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid notice ID",
          });
        }

        const notice = await noticeCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!notice) {
          return res.status(404).send({
            success: false,
            message: "Notice not found",
          });
        }

        res.send({ success: true, data: notice });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch notice",
        });
      }
    });


app.patch("/notice/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const result = await noticeCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isPublished: isPublished,
          updatedAt: new Date(),
        },
      }
    );

    res.send({
      success: true,
      message: isPublished ? "Notice Published" : "Notice Unpublished",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to update notice status",
    });
  }
});

  } catch (error) {
    console.log(error);
  }
}
run();

/* test route */
app.get("/", (req, res) => {
  res.send("Notice Server Running ✅");
});

app.listen(port, () => {
  console.log("server ok", port);
});
