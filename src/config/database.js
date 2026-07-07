const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log("🌐 Connecting to PostgreSQL with:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
  }
);

sequelize.query("SELECT inet_server_addr();").then(([result]) => {
  console.log("✅ Connected to DB on IP:", result[0].inet_server_addr);
}).catch((err) => {
  console.error("❌ DB connection test failed:", err);
});

module.exports = sequelize;
