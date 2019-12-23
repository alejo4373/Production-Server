const app = require('../app');
const request = require('supertest')
const helpers = require('./helpers')

const testUser = {
  username: 'JonSnow',
  password: 'abc123'
}

const testTodo = {
  text: "test todo",
  value: 200
}

const expectedTodo = {
  ...testTodo,
  id: 1,
  completed: false,
  owner_id: 1
}


const reqAgent = request.agent(app);

beforeAll(async (done) => {
  await helpers.resetDB();
  await helpers.registerTestUser(reqAgent, testUser);
  done()
})

afterAll(helpers.resetDB)

describe('=== /todos route functionality ===', () => {
  it('Should add a todo', (done) => {
    expect.assertions(4)

    reqAgent
      .post('/api/todos/new')
      .send(testTodo)
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;

        expect(status).toBe(201)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.payload.todo).toEqual(expectedTodo)
        expect(body.error).toBe(false)

        done();
      })
  })

  it('Should get a todo with id 1', (done) => {
    expect.assertions(4)

    reqAgent
      .get('/api/todos/1')
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;

        expect(status).toBe(200)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.payload.todo).toEqual(expectedTodo)
        expect(body.error).toBe(false)

        done();
      })
  })

})
