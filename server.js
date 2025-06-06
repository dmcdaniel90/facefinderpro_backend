const express = require("express");
const app = express();
const helmet = require("helmet");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
require('dotenv').config()

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

const sslOption = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : false;

const db = knex({
  client: "pg",
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    ssl: sslOption,
  },
});

const corsOptions = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(helmet());

app.get("/", (req, res) => {
  res.status(200).send(db.users);
});

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, db, bcrypt);
});
app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});
app.get("/profile/:id", (req, res) => {
  profile.handleGetProfile(req, res, db);
});
app.put("/image", (req, res) => {
  image.handleImageSubmit(req, res, db);
});
app.post("/imageurl", (req, res) => {
  image.handleApiCall(req, res);
});

app.listen((port = process.env.PORT || 3000), () => {
  console.log(`Success. App running on port ${port}`);
});
