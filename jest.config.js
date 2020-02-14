process.env.DATABASE_URL = "postgres://localhost:5432/production_test_db" // Set test database url
module.exports = {
  setupFilesAfterEnv: ["jest-extended"]
}
