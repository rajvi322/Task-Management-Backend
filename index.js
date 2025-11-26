const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const appRouter = require("./routes/Auth");
const spaceRouter = require("./routes/Spaces");
const groupRouter = require("./routes/Group");
const taskRouter = require("./routes/Tasks");

// const db = require("./config/config").get(process.env.NODE_ENV);

const app = express();
const dotenv = require("dotenv");
dotenv.config();
const uri = "mongodb://0.0.0.0:27017/productivity-app";
mongoose
  .connect(uri)
  .then((result) => {
    console.log("connected to Mongodb");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

app.use("/api", appRouter);
app.use("/api/space", spaceRouter);
app.use("/api/group", groupRouter);
app.use("/api/task", taskRouter);

app.get("/", function (req, res) {
  res.status(200).send("Welcome to login, sign-up api");
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`APP is live at port ${PORT}`);
});
