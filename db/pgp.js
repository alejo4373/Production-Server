const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL)

const recordNotFound = (err) => {
  return err instanceof pgp.errors.QueryResultError && err.code === pgp.errors.queryResultErrorCode.noData
}

const invalidInteger = (err) => {
  return err.code === "22P02" && err.message.includes("invalid input syntax for integer")
}

module.exports = {
  helpers: pgp.helpers,
  db,
  recordNotFound,
  invalidInteger
}
