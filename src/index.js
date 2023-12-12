const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const path = require("node:path");
require("dotenv").config();

const app = express();

var prod = false;
if (process.env.NODE_ENV == "PRODUCTION") prod = true;

const index = require("./web/routers/index");
const callbacks = require("./web/routers/callbacks");
const dashboard = require("./web/routers/dashboard");

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(
    session({
      secret: process.env.EXPRESS_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: { secure: prod },
    })
  )
  .use(express.static(path.join(__dirname, "web", "public")))
  .engine("html", require("ejs").renderFile)
  .set("view engine", "ejs")
  .set("views", path.join(__dirname, "web", "views"))
  .use("/dashboard", dashboard)
  .use("/callbacks", callbacks)
  .use("/", index)
  .listen(8080, () =>
    console.log(
      "Website is running on port 8080 quick link here http://localhost:8080"
    )
  );

mongoose.connect(process.env.MONGO_URL);
