require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

// const { socketSetup } = require("./config/socketIo");
const bodyParser = require("body-parser");
const cors = require("cors"); // <-- Import cors
const sequelize = require("./config/db");

const adminBootstrap = require("./config/bootstrap");
const startEventReminderJob = require("./api/helper/startEventReminderJob");

require("./config/firebase");
const apiRoutes = require("./api/routes/index");

//socketIo

app.use(
  cors({
    origin: "*",
    // origin: ["http://localhost:5173", , "http://127.0.0.1:5501"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "api", "public")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "api", "public", "index.html"));
});

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

(async () => {
  try {
    const result = await adminBootstrap();
    console.log("adminBootstrap");
  } catch (err) {
    console.log(err.message);
  }
})();

//cron job:
startEventReminderJob();

//Routes
app.use("/api", apiRoutes);

const PORT = process.env.PORT;

server.listen(PORT, async () => {
  try {
    // socketSetup(server);
    // await sequelize.sync({ alter: true });
    // await sequelize.sync({ force: true });
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
