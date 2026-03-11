// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./src/routes");

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(bodyParser.json());

// Basic health check
app.get("/", (req, res) =>
  res.json({ ok: true, service: "Intelligent Community Node" }),
);

// Mount API routes
app.use("/api", routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
