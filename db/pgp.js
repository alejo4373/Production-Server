const pgp = require('pg-promise')();
const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/production_dev_db";

const recordNotFound = (err) => {
  return err instanceof pgp.errors.QueryResultError && err.code === pgp.errors.queryResultErrorCode.noData
}

const invalidInteger = (err) => {
  return err.code === "22P02" && err.message.includes("invalid input syntax for integer")
}

module.exports = {
  helpers: pgp.helpers,
  db: pgp(connectionString),
  recordNotFound,
  invalidInteger
}
