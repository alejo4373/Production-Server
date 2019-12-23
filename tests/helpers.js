const request = require('supertest')
const DBMigrate = require('db-migrate')
const app = require('../app');
const dbm = DBMigrate.getInstance(true, {
  cmdOptions: {
    'migrations-dir': './db/migrations' // Relative to test runner root
  }
});

const resetDB = async () => {
  try {
    dbm.silence(true);
    await dbm.reset();
    await dbm.up();
    // return true
  } catch (err) {
    console.log('ERROR', err)
    throw err
  }
}

const registerTestUser = async (agent, user) => {
  return new Promise((resolve, reject) => {
    agent
      .post('/api/auth/signup')
      .send(user)
      .end((err, res) => {
        if (err) {
          return reject(err)
        }

        resolve(res.body)
      })
  })
}

const RESPONSE_PROPERTIES = ["payload", "message", "error"];

module.exports = {
  registerTestUser,
  resetDB,
  RESPONSE_PROPERTIES
}
