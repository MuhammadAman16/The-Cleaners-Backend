import express from "express";
import mysql from "mysql";

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "thecleanersapp",
});

connection.connect();

connection.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
  if (error) throw error;
  console.log("The solution is: ", results[0].solution);
});

app.get("/api/users", function (req, res) {
  connection.query("SELECT * FROM users", function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.log(rows);
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

app.get("/api/orders", (req, res) => {
  const { images, name, address, phone, shirts, pants, instructions, userid } =
    req.body;

  const insertQuery = `INSERT INTO orders ( images, name, address, phone, shirts, pants, instructions, userid) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    images,
    name,
    address,
    phone,
    shirts,
    pants,
    instructions,
    userid,
  ];

  connection.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error inserting data into orders:", error);
      res
        .status(500)
        .json({ error: "An error occurred while inserting data into orders." });
    } else {
      console.log("Data inserted into orders:", results);
      res
        .status(200)
        .json({ message: "Data successfully inserted into orders." });
    }
  });
});

app.listen("3000", () => {
  console.log("server started on port 3000");
});
