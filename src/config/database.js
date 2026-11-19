const { Sequelize } = require('sequelize');
require('dotenv').config();

// Tests run sequelize.sync({ force: true }), which DROPS every table. They must never touch
// the real database: under NODE_ENV=test use DB_NAME_TEST (default "<DB_NAME>_test") and
// refuse to start unless the name ends in "_test".
const isTest = process.env.NODE_ENV === 'test';
const DB_NAME = isTest
  ? (process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`)
  : process.env.DB_NAME;

if (isTest && !/_test$/.test(DB_NAME)) {
  throw new Error(`Refusing to run tests against "${DB_NAME}": test database name must end in "_test".`);
}

console.log("🌐 Connecting to PostgreSQL with:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", DB_NAME);

const sequelize = new Sequelize(
  DB_NAME,
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
