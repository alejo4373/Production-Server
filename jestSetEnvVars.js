/*
* jestSetEnvVars
* Custom file to initialize additional environment variables needed for my
* test environment
*
* by @alejo4373 
*/
const jestSetEnvVars = () => {
  process.env.SESSION_SECRET = "A_SUPER_SECRET"
}

jestSetEnvVars();
