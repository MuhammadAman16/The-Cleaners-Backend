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

app.get("/users", function (req, res) {
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

app.listen("3000", () => {
  console.log("server started on port 3000");
});
