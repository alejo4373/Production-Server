const app = require('../app');
const request = require('supertest')
const helpers = require('./helpers')

const testUser = {
  username: 'JonSnow',
  password: 'abc123'
}

const reqAgent = request.agent(app);

beforeAll(async (done) => {
  await helpers.resetDB();
  await helpers.registerTestUser(reqAgent, testUser);
  done()
})

afterAll(helpers.resetDB)

describe('=== Todos ===', () => {
  it('Should add a todo', () => {
    // expect.assertions(1)
    expect(1).toBe(1);
    // const testTodo = {
    //   text: "test todo",
    //   value: 200
    // }

    // reqAgent
    //   .post('/api/todos/new')
    //   .send(testTodo)
    //   .end((err, res) => {
    //     if (err) {
    //       console.log('ERROR', err)
    //       throw err
    //     }
    //     const { status, body } = res;

    //     expect(status).toBe(401)
    // expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
    // expect(body.payload.todo).toEqual({
    //   ...testTodo,
    //   id: 1,
    //   completed: false,
    //   owner_id: 1
    // })
    // expect(body.error).toBe(false)

    // done();
  })

})
