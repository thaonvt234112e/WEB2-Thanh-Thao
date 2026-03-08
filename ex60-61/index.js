const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ObjectId } = require("mongodb");

console.log("🔥 THIS IS THE CORRECT FILE");

const app = express();
const port = 3002;

// ================= MIDDLEWARE =================
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// ================= COOKIE API (Exercise 60) =================

// Create Cookie
app.get("/create-cookie", (req, res) => {

  res.cookie("username", "tranduythanh");
  res.cookie("password", "123456");

  res.cookie("account", JSON.stringify({
    username: "tranduythanh",
    password: "123456"
  }));

  res.send("Cookies created successfully");

});

// Read Cookie
app.get("/read-cookie", (req, res) => {

  const username = req.cookies.username;
  const password = req.cookies.password;

  let account = {};

  if (req.cookies.account) {
    account = JSON.parse(req.cookies.account);
  }

  let result = "";
  result += "username = " + username + "<br>";
  result += "password = " + password + "<br>";
  result += "account.username = " + account.username + "<br>";
  result += "account.password = " + account.password;

  res.send(result);

});

// Clear Cookie
app.get("/clear-cookie", (req, res) => {

  res.clearCookie("account");

  res.send("Account cookie removed");

});

// ================= MONGODB =================

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let fashionCollection;
let userCollection;

// ================= START SERVER =================

async function startServer() {

  try {

    await client.connect();
    console.log("✅ MongoDB connected");

    const database = client.db("FashionData");

    fashionCollection = database.collection("Fashion");
    userCollection = database.collection("User");

    // ================= TEST SERVER =================

    app.get("/", (req, res) => {
      res.send("🚀 Server running...");
    });

    // ================= LOGIN API (Exercise 61) =================

    app.post("/login", async (req, res) => {

      try {

        const username = req.body.username;
        const password = req.body.password;

        const user = await userCollection.findOne({
          username: username,
          password: password
        });

        if (!user) {
          return res.status(401).send("Login failed");
        }

        // Save cookie
        res.cookie("loginUser", JSON.stringify({
          username: username,
          password: password
        }));

        res.send("Login successful");

      } catch (error) {

        res.status(500).send("Server error");

      }

    });

    // Read login cookie
    app.get("/login-cookie", (req, res) => {

      if (!req.cookies.loginUser) {
        return res.json({});
      }

      const user = JSON.parse(req.cookies.loginUser);

      res.json(user);

    });

    // ================= FASHION CRUD =================

    // GET ALL
    app.get("/fashions", async (req, res) => {

      try {

        const result = await fashionCollection.find({}).toArray();
        res.json(result);

      } catch (error) {

        res.status(500).json({ error: "Cannot get fashions" });

      }

    });

    // GET BY ID
    app.get("/fashions/:id", async (req, res) => {

      try {

        const id = new ObjectId(req.params.id);

        const fashion = await fashionCollection.findOne({ _id: id });

        if (!fashion) {
          return res.status(404).send("Fashion not found");
        }

        res.json(fashion);

      } catch (error) {

        res.status(400).send("Invalid ID");

      }

    });

    // CREATE
    app.post("/fashions", async (req, res) => {

      try {

        const newFashion = {
          style: req.body.style,
          fashion_subject: req.body.fashion_subject,
          fashion_detail: req.body.fashion_detail,
          fashion_image: req.body.fashion_image
        };

        const result = await fashionCollection.insertOne(newFashion);

        res.json(result);

      } catch (error) {

        res.status(500).send("Insert failed");

      }

    });

    // UPDATE
    app.put("/fashions/:id", async (req, res) => {

      try {

        const id = new ObjectId(req.params.id);

        await fashionCollection.updateOne(
          { _id: id },
          {
            $set: {
              style: req.body.style,
              fashion_subject: req.body.fashion_subject,
              fashion_detail: req.body.fashion_detail,
              fashion_image: req.body.fashion_image
            }
          }
        );

        const updated = await fashionCollection.findOne({ _id: id });

        res.json(updated);

      } catch (error) {

        res.status(500).send("Update failed");

      }

    });

    // DELETE
    app.delete("/fashions/:id", async (req, res) => {

      try {

        const id = new ObjectId(req.params.id);

        const fashion = await fashionCollection.findOne({ _id: id });

        if (!fashion) {
          return res.status(404).send("Fashion not found");
        }

        await fashionCollection.deleteOne({ _id: id });

        res.json({
          message: "Deleted successfully",
          data: fashion
        });

      } catch (error) {

        res.status(400).send("Invalid ID");

      }

    });

    // ================= START SERVER =================

    app.listen(port, () => {

      console.log(`🚀 Server running at http://localhost:${port}`);

    });

  } catch (error) {

    console.error("❌ MongoDB connection failed", error);

  }

}

startServer();