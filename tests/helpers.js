const DBMigrate = require('db-migrate')
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

const registerTestUser = async (agent) => {
  const testUser = {
    username: 'JonSnow',
    password: 'abc123',
    email: 'jon@winterfell.com'
  }

  return new Promise((resolve, reject) => {
    agent
      .post('/api/auth/signup')
      .send(testUser)
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
