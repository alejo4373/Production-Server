const app = require('../app');
const request = require('supertest')
const DBMigrate = require('db-migrate')
const dbm = DBMigrate.getInstance(true, {
  cmdOptions: {
    'migrations-dir': './db/migrations' // Relative to test runner root
  }
});


beforeAll(async () => {
  try {
    dbm.silence(true);
    await dbm.reset();
    await dbm.up();
  } catch (err) {
    throw err;
  }
})

describe('=== User Authentication ===', () => {
  it('User registration/sign-up successful', (done) => {
    expect.assertions(2)

    const newUser = {
      username: 'JonDoe',
      password: 'abc123'
    }

    request(app)
      .post('/api/auth/signup')
      .send(newUser)
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;
        expect(status).toBe(200)
        expect(body).toEqual({
          "payload": {
            "user": {
              "id": 1,
              "username": "JonDoe",
              "points": 0
            },
            "msg": "User registered and logged in"
          },
          "err": false
        })
        done();
      })
  })
})
