const app = require('../app');
const request = require('supertest')
const helpers = require('./helpers')

const reqAgent = request.agent(app) // Needed to keep cookies in node

beforeAll(helpers.resetDB)
afterAll(helpers.resetDB)

const RESPONSE_PROPERTIES = ["payload", "message", "error"];

describe('=== User Authentication ===', () => {
  it('Should register/sign-up a user successfully with starting points set to 0', (done) => {
    expect.assertions(6)

    const newUser = {
      username: 'JonDoe',
      password: 'abc123'
    }

    reqAgent
      .post('/api/auth/signup')
      .send(newUser)
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;

        expect(status).toBe(201)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload.user).toContainAllKeys(["id", "username", "points", "email"])
        expect(body.payload.user.username).toBe(newUser.username)
        expect(body.payload.user.points).toBe(0)
        expect(body.error).toBe(false)

        done();
      })
  })

  it('Should not allow the registration/sign-up of a user with a username already taken', (done) => {
    expect.assertions(4)

    const newUser = {
      username: 'JonDoe',
      password: 'abc123'
    }

    reqAgent
      .post('/api/auth/signup')
      .send(newUser)
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;

        expect(status).toBe(409)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload).toBe(null)
        expect(body.error).toBe(true)

        done();
      })
  })

  it('Should allow a registered user to login', (done) => {
    expect.assertions(5)

    const newUser = {
      username: 'JonDoe',
      password: 'abc123'
    }

    reqAgent
      .post('/api/auth/login')
      .send(newUser)
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;

        expect(status).toBe(200)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload.user).toContainAllKeys(["id", "username", "points", "email"])
        expect(body.payload.user.username).toBe(newUser.username)
        expect(body.error).toBe(false)

        done();
      })
  })

  it('Should successfully logout a logged-in user', (done) => {
    expect.assertions(5)

    reqAgent
      .get('/api/auth/logout')
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;

        expect(status).toBe(200)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload).toBe(null)
        expect(body.message).toMatch(/success/)
        expect(body.error).toBe(false)

        done();
      })
  })

  it('Should prevent the login of an unregistered user', (done) => {
    expect.assertions(5)

    const newUser = {
      username: 'DonDoe',
      password: 'abc123'
    }

    reqAgent
      .post('/api/auth/login')
      .send(newUser)
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;

        expect(status).toBe(401)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload).toBe(null)
        expect(body.message).toBe("Wrong username or password")
        expect(body.error).toBe(true)

        done();

      })
  })

  it('Should prevent the login of a user with the wrong password', (done) => {
    expect.assertions(5)

    const newUser = {
      username: 'JonDoe',
      password: 'xyz123'
    }

    reqAgent
      .post('/api/auth/login')
      .send(newUser)
      .end((err, res) => {
        if (err) throw err
        const { status, body } = res;

        expect(status).toBe(401)
        expect(body).toContainAllKeys(RESPONSE_PROPERTIES)
        expect(body.payload).toBe(null)
        expect(body.message).toBe("Wrong username or password")
        expect(body.error).toBe(true)

        done();
      })
  })
})
