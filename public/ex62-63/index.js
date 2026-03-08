const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { MongoClient, ObjectId } = require("mongodb");

console.log("🔥 THIS IS THE CORRECT FILE");

const app = express();
const port = 3002;

// ================= MIDDLEWARE =================
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());

app.use(
  session({
    secret: "Shh, its a secret!",
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ================= COOKIE API (Exercise 60) =================

// Create Cookie
app.get("/create-cookie", (req, res) => {
  res.cookie("username", "tranduythanh");
  res.cookie("password", "123456");

  res.cookie(
    "account",
    JSON.stringify({
      username: "tranduythanh",
      password: "123456"
    })
  );

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
  result += "account.username = " + (account.username || "") + "<br>";
  result += "account.password = " + (account.password || "");

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
let productCollection;

// ================= HELPER =================
function initializeCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
}

// ================= START SERVER =================

async function startServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected");

    const database = client.db("FashionData");

    fashionCollection = database.collection("Fashion");
    userCollection = database.collection("User");
    productCollection = database.collection("Product");

    // ================= TEST SERVER =================

    app.get("/", (req, res) => {
      res.redirect("/products.html");
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

        res.cookie(
          "loginUser",
          JSON.stringify({
            username: username,
            password: password
          })
        );

        res.send("Login successful");
      } catch (error) {
        res.status(500).send("Server error");
      }
    });

    app.get("/login-cookie", (req, res) => {
      if (!req.cookies.loginUser) {
        return res.json({});
      }

      const user = JSON.parse(req.cookies.loginUser);
      res.json(user);
    });

    // ================= SESSION API (Exercise 62) =================

    app.get("/contact", (req, res) => {
      if (req.session.visited == null) {
        req.session.visited = 1;
        res.send("Welcome to this page for the first time!");
      } else {
        req.session.visited++;
        res.send("You visited this page " + req.session.visited + " times");
      }
    });

    // ================= PRODUCT API (Exercise 63) =================

    // Get all products
    app.get("/products", async (req, res) => {
      try {
        const result = await productCollection.find({}).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Cannot get products" });
      }
    });

    // Add product to cart (session)
    app.post("/cart/add/:id", async (req, res) => {
      try {
        initializeCart(req);

        const id = new ObjectId(req.params.id);
        const product = await productCollection.findOne({ _id: id });

        if (!product) {
          return res.status(404).send("Product not found");
        }

        const existingIndex = req.session.cart.findIndex(
          (item) => item.productId === req.params.id
        );

        if (existingIndex !== -1) {
          req.session.cart[existingIndex].quantity += 1;
        } else {
          req.session.cart.push({
            productId: req.params.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
          });
        }

        res.json({
          message: "Product added to cart",
          cart: req.session.cart
        });
      } catch (error) {
        res.status(400).send("Invalid product ID");
      }
    });

    // Get cart
    app.get("/cart", (req, res) => {
      initializeCart(req);

      const cart = req.session.cart.map((item) => {
        return {
          ...item,
          total: item.price * item.quantity
        };
      });

      const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

      res.json({
        items: cart,
        grandTotal: grandTotal
      });
    });

    // Update cart: quantity + remove checked items
    app.post("/cart/update", (req, res) => {
      initializeCart(req);

      const items = req.body.items;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }

      let newCart = [];

      for (const item of items) {
        const quantity = parseInt(item.quantity);

        if (item.remove === true) {
          continue;
        }

        if (!quantity || quantity <= 0) {
          continue;
        }

        const oldItem = req.session.cart.find(
          (cartItem) => cartItem.productId === item.productId
        );

        if (oldItem) {
          newCart.push({
            ...oldItem,
            quantity: quantity
          });
        }
      }

      req.session.cart = newCart;

      const result = req.session.cart.map((item) => ({
        ...item,
        total: item.price * item.quantity
      }));

      const grandTotal = result.reduce((sum, item) => sum + item.total, 0);

      res.json({
        message: "Cart updated successfully",
        items: result,
        grandTotal: grandTotal
      });
    });

    // Clear cart
    app.get("/cart/clear", (req, res) => {
      req.session.cart = [];
      res.send("Cart cleared");
    });

    // ================= FASHION CRUD =================

    app.get("/fashions", async (req, res) => {
      try {
        const result = await fashionCollection.find({}).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Cannot get fashions" });
      }
    });

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