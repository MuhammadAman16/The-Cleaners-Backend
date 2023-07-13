import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "thecleanersapp",
});

connection.connect();

app.get("/api/users", function (res) {
  connection.query("SELECT * FROM users", function (error, rows) {
    if (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(rows);
    }
  });
});

app.get("/api/users/:id", function (req, res) {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log(rows);
        res.json(rows);
      }
    }
  );
});

// Function to generate a random authentication token

function generateAuthToken(user) {
  try {
    const key = "secretkey";
    const token = jwt.sign(user, key);
    return token;
  } catch (error) {
    // Handle any errors that occur during token generation
    console.log("Error generating auth token:", error);
    return null; // or throw an error, depending on your use case
  }
}

// LOGIN: Route to handle user authentication
app.post("/api/auth", (req, res) => {
  const { email, password } = req.body;

  authenticateUser(email, password)
    .then((authToken) => {
      if (authToken) {
        res.json({ authToken });
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Function to perform the authentication
function authenticateUser(email, password) {
  return new Promise((resolve, reject) => {
    // Check if the email and password match in the database
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    connection.query(query, [email, password], (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (result.length === 0) {
          // Authentication failed
          resolve(null);
        } else {
          // Authentication succeeded
          const user = { ...result[0] }; // Create a plain object from result[0]
          const authToken = generateAuthToken(user);
          resolve(authToken);
        }
      }
    });
  });
}

// API TO REGISTER USERS
app.post("/api/users", (req, res) => {
  const { email, password, username } = req.body;

  // Check if the email or username already exists in the database
  const checkQuery = "SELECT * FROM users WHERE email = ? ";
  connection.query(checkQuery, email, (error, result) => {
    if (error) {
      console.error("Error checking existing users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (result.length > 0) {
        // User with the same email or username already exists
        res.status(409).json({ error: "User already exists" });
      } else {
        // User does not exist, proceed with registration
        const insertQuery =
          "INSERT INTO users (email, password, username) VALUES (?, ?, ?)";
        connection.query(
          insertQuery,
          [email, password, username],
          (error, result) => {
            if (error) {
              console.error("Error registering new user:", error);
              res.status(500).json({ error: "Internal Server Error" });
            } else {
              console.log("Result:", result);
              res.status(200).json({ success: true });
            }
          }
        );
      }
    }
  });
});

// api to post orders
app.post("/api/orders", (req, res) => {
  const { userid, name, address, phone, shirts, pants, instructions } =
    req.body;

  const insertQuery = `INSERT INTO orders ( userid, name, address, phone, shirts, pants, instructions ) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [userid, name, address, phone, shirts, pants, instructions];

  connection.query(insertQuery, values, (error, result) => {
    if (error) {
      console.error("Error inserting data into orders:", error);
      res
        .status(500)
        .json({ error: "An error occurred while inserting data into orders." });
    } else {
      const insertedOrder = result.insertId;
      res.status(200).json({
        message: "Data successfully inserted into orders.",
        orderId: insertedOrder,
      });
    }
  });
});

// RECEIPT
app.get("/api/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  const selectQuery = `SELECT * FROM orders WHERE order_id = ?`;
  const values = [orderId];

  connection.query(selectQuery, values, (error, result) => {
    if (error) {
      console.error("Error retrieving order from the table:", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the order." });
    } else {
      if (result.length === 0) {
        res.status(404).json({ message: "Order not found." });
      } else {
        const order = result;
        res.status(200).json({ order });
      }
    }
  });
});

app.listen("3000", () => {
  console.log("server started on port 3000");
});
