// server/server.js
// Although this is the primary sever file, most of the code and 
// route handling is done in /routes for a cleaner layout
const express = require("express");
const path = require('path')
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
// CORS (Cross-Origin Resource Sharing) is used to allow requests from different origins
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get("/", (req, res) => {
  // Make sure you have bothe the client and server running
  res.send("This is the server side. To visit the client, go to localhost:3000");
});
const routes = require("./router");;
app.use(routes);

app.listen(PORT, () => {
  // In dev mode, this will be on localhost:`{PORT}`
  // In production it should be the deployed URL
  console.log(`Server listening on http://localhost:${PORT}`);
});