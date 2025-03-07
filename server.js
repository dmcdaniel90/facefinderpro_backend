const express = require("express");
const app = express();
const helmet = require("helmet");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

const corsOptions = {
  origin: [
    "http://facefinderpro-production.up.railway.app",
    "http://facefinderpro-production.up.railway.app/register",
    "http://facefinderpro-production.up.railway.app/signin",
    "http://facefinderpro-production.up.railway.app/profile/:id",
    "http://facefinderpro-production.up.railway.app/image",
    "http://facefinderpro-production.up.railway.app/imageurl",
    "http://facefinderpro-production.up.railway.app/",
  ],
  optionsSuccessStatus: 200,
  preflightContinue: true,
};

const db = knex({
  client: "pg",
  connection: {
    host: process.env.SUPABASE_DB_HOST,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
    port: process.env.SUPABASE_DB_PORT,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    tableName: "knex_migrations",
  }
});

app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.status(200).json("Success");
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
