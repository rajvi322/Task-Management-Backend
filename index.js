const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
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

// CORS configuration
// In development, allow all origins for easier debugging
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl, or same-origin via proxy)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost and 127.0.0.1 origins
    if (process.env.NODE_ENV !== "production") {
      const isLocalhost = 
        origin.startsWith("http://localhost:") || 
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://0.0.0.0:");
      
      if (isLocalhost) {
        return callback(null, true);
      }
    }
    
    // Production: use specific allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests for all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
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
