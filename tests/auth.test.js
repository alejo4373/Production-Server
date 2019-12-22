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

const RESPONSE_PROPERTIES = ["payload", "message", "error"];

describe('=== User Authentication ===', () => {
  it('Should register/sign-up a user successfully with starting points set to 0', (done) => {
    expect.assertions(6)

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

        expect(status).toBe(201)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload.user).toContainAllKeys(["id", "username", "points"])
        expect(body.payload.user.username).toBe(newUser.username)
        expect(body.payload.user.points).toBe(0)
        expect(body.error).toBe(false)

        done();
      })
  })
})
