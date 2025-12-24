import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import { ObjectId } from "mongodb";

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

    const noticeCollection = client
      .db("noticeDB")
      .collection("notices");

    console.log("MongoDB Connected Successfully 🚀");

    /* =========================
       ✅ CREATE NOTICE (POST)
    ========================== */
    app.post("/notice", async (req, res) => {
      try {
        const isPublished = req.body.isPublished || false;
        
        const notice = {
          ...req.body,
          isPublished: isPublished,
          status: isPublished ? "published" : "draft", // Sync both fields
          createdAt: new Date(),
        };

        const result = await noticeCollection.insertOne(notice);

        res.send({
          success: true,
          message: "Notice created successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          success: false,
          message: "Failed to create notice",
        });
      }
    });

    /* =========================
       ✅ GET NOTICES (FIXED)
    ========================== */
    app.get("/notice", async (req, res) => {
      try {
        const { status, department, employee, date } = req.query;

        console.log("🔍 Query params:", req.query);

        let filter = {};

        // ✅ STATUS FILTER - Check both fields for compatibility
        if (status === "published") {
          filter.$or = [
            { status: "published" },
            { isPublished: true }
          ];
        } else if (status === "draft") {
          filter.$or = [
            { status: "draft" },
            { isPublished: false }
          ];
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

        console.log("🔎 MongoDB filter:", JSON.stringify(filter, null, 2));

        const notices = await noticeCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray();

        console.log(`✅ Found ${notices.length} notices`);

        res.send({ success: true, data: notices });
      } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).send({ success: false, data: [] });
      }
    });

    /* =========================
       ✅ UPDATE STATUS (FIXED)
    ========================== */
    app.patch("/notice/:id/status", async (req, res) => {
      try {
        const { id } = req.params;
        const { isPublished } = req.body;

        const result = await noticeCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              isPublished: isPublished,
              status: isPublished ? "published" : "draft", // Sync both fields
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
  console.log(`Server running on port ${port} ✅`);
});



// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { MongoClient, ServerApiVersion } from "mongodb";
// import { ObjectId } from "mongodb";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// /* middleware */
// app.use(cors());
// app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@urmi-project.bsifax9.mongodb.net/?appName=urmi-project`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();

//     const noticeCollection = client
//       .db("noticeDB")
//       .collection("notices");

//     console.log("MongoDB Connected Successfully 🚀");

//     /* =========================
//        ✅ CREATE NOTICE (POST)
//     ========================== */
//    app.post("/notice", async (req, res) => {
//   try {
//     const notice = {
//       ...req.body,
//       createdAt: new Date(),
//     };

//     const result = await noticeCollection.insertOne(notice);

//     res.send({
//       success: true,
//       message: "Notice published successfully",
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       success: false,
//       message: "Failed to publish notice",
//     });
//   }
// });



// app.get("/notice", async (req, res) => {
//   try {
//     const { status, department, employee, date } = req.query;

//     let filter = {};

//     // Active / Draft
//     if (status === "published") {
//       filter.isPublished = true;
//     } else if (status === "draft") {
//       filter.isPublished = false;
//     }

//     // Department
//     if (department) {
//       filter.targetDepartment = department;
//     }

//     // Employee (id or name)
//     if (employee) {
//       filter.$or = [
//         { employeeId: employee },
//         { employeeName: { $regex: employee, $options: "i" } },
//       ];
//     }

//     // Publish date
//     if (date) {
//       filter.publishDate = date;
//     }

//     const notices = await noticeCollection
//       .find(filter)
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.send({ success: true, data: notices });
//   } catch (error) {
//     res.status(500).send({ success: false, data: [] });
//   }
// });


// app.patch("/notice/:id/status", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isPublished } = req.body;

//     const result = await noticeCollection.updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           isPublished: isPublished,
//           updatedAt: new Date(),
//         },
//       }
//     );

//     res.send({
//       success: true,
//       message: isPublished ? "Notice Published" : "Notice Unpublished",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       success: false,
//       message: "Failed to update notice status",
//     });
//   }
// });




//   } catch (error) {
//     console.log(error);
//   }
// }
// run();

// /* test route */
// app.get("/", (req, res) => {
//   res.send("Notice Server Running ✅");
// });

// app.listen(port, () => {
//   console.log("server ok", port);
// });





// // import dotenv from "dotenv";
// // import express from "express";
// // import cors from "cors";
// // import { MongoClient, ServerApiVersion } from "mongodb";
// // dotenv.config();
// // const app = express();
// // const port = process.env.PORT || 3000;
// // app.use(cors());
// // app.use(express.json());

// // const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@urmi-project.bsifax9.mongodb.net/?appName=urmi-project`;

// // const client = new MongoClient(uri, {
// //   serverApi: {
// //     version: ServerApiVersion.v1,
// //     strict: true,
// //     deprecationErrors: true,
// //   },
// // });

// // async function run() {
// //   try {
// //     await client.connect();

// //     const noticeCollection = client.db("noticeDB").collection("notices");

// //     console.log("MongoDB Connected Successfully 🚀");

   

// //   } catch (error) {
// //     console.log(error);
// //   }
// // }

// // run();

// // app.get("/", (req, res) => {
// //   res.send("Notice Server Running ✅");
// // });

// // app.listen(port, () => {
// //   console.log('server ok', port);
// // });
