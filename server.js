require("dotenv").config();
const express = require("express");
const cors = require("cors"); // <-- Import cors
const sequelize = require("./config/db");

require("./config/firebase");
const apiRoutes = require("./api/routes/index");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Routes
app.use("/api", apiRoutes);


const PORT = process.env.PORT;

app.listen(PORT, async () => {
  try {
    // await sequelize.sync({ alter: true });
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
