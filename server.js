require("dotenv").config();
const express = require("express");

const app = express();
const server = require("http").createServer(app);

const { socketSetup } = require("./config/socketIo");
const bodyParser = require("body-parser");
const cors = require("cors"); // <-- Import cors
const sequelize = require("./config/db");
const adminBootstrap = require("./config/bootstrap");

require("./config/firebase");
const apiRoutes = require("./api/routes/index");

//socketIo

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

//Routes
app.use("/api", apiRoutes);

const PORT = process.env.PORT;

server.listen(PORT, async () => {
  try {
    socketSetup(server);
    // await sequelize.sync({ force: true });
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
