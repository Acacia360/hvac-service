const express = require("express");
const cors = require("cors");

const hvacRoutes = require("./routes/hvac");
const logRoutes = require('./routes/logRoutes');
const hvacDataRoutes = require("./routes/hvacData");

const { standardAPILogger, errorAPILogger } = require("./middlewares/apiLogger");

require("dotenv").config();

const db = require("./models");

const app = express();

app.use(cors());
app.use(express.json());
app.use(standardAPILogger());

app.use("/api/hvac", hvacRoutes);
app.use("/api/hvacData", hvacDataRoutes);
app.use('/api/hvacLogs', logRoutes);

app.get("/health", (req, res) => res.status(200).send("OK"));

app.use(errorAPILogger);

module.exports = app;

const PORT = process.env.PORT || 3029;

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables synced successfully!");
    app.listen(PORT, () => {
      console.log(`HVAC service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });