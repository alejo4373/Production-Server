/*
* jestSetEnvVars
* Custom file to initialize additional environment variables needed for my
* test environment
*
* by @alejo4373 
*/
const jestSetEnvVars = () => {
  process.env.DATABASE_URL = "postgres://localhost:5432/production_test_db" // Set test database url
}

jestSetEnvVars();
