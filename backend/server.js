// server/server.js
// Although this is the primary sever file, most of the code and 
// route handling is done in /routes for a cleaner layout
const express = require("express");
const path = require('path')
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';

// CORS (Cross-Origin Resource Sharing) - allow requests from the client origin(s)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,           // set on Render if needed
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman) and any matching origin
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3005;

app.get("/", (req, res) => {
  res.send(`This is the server side. To visit the client, go to <a href="${clientURL}">${clientURL}</a>`);
});
const routes = require("./router");;
app.use(routes);

app.listen(PORT, () => {
  // In dev mode, this will be on localhost:`{PORT}`
  // In production it should be the deployed URL
  console.log(`Server listening on http://localhost:${PORT}`);
});