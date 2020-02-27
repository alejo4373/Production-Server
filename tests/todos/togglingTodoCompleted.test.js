const app = require('../../app');
const request = require('supertest')
const helpers = require('../helpers')
const reqAgent = request.agent(app);

const testUser = {
  username: 'JonSnow',
  password: 'abc123'
}

const newTodo = {
  text: "test todo",
  value: 200
}

let newTodoId;

beforeAll(async (done) => {
  await helpers.resetDB();
  await helpers.registerTestUser(reqAgent, testUser);
  const { body } = await reqAgent.post('/api/todos').send(newTodo) // Add todo
  newTodoId = body.payload.todo.id
  done()
})

afterAll(helpers.resetDB)

describe('Toggling todo completed behavior', () => {

  it('Should reward user the todo\'s value when todo is completed', async (done) => {
    expect.assertions(7)

    let todoUpdates = {
      completed: true,
    }

    try {
      let expectedUpdatedTodo = {
        id: newTodoId,
        ...newTodo,
        ...todoUpdates
      }

      let { status, body } = await reqAgent.patch(`/api/todos/${newTodoId}`).send(todoUpdates)
      const { todo, user } = body.payload
      expect(status).toBe(200)
      expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
      expect(todo).toBeObject()
      expect(todo.completed).toBe(expectedUpdatedTodo.completed)

      expect(user).toBeObject()
      expect(user.points).toBe(newTodo.value)
      expect(body.error).toBe(false)
      done();

    } catch (err) {
      throw err
    }
  })

  it('Should forfeit todo value from user when an already completed todo is updated to incomplete', async (done) => {
    expect.assertions(7)

    let todoUpdates = {
      completed: false,
    }

    try {
      let expectedUpdatedTodo = {
        id: newTodoId,
        ...newTodo,
        ...todoUpdates
      }

      let { status, body } = await reqAgent.patch(`/api/todos/${newTodoId}`).send(todoUpdates)
      const { todo, user } = body.payload
      expect(status).toBe(200)
      expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
      expect(todo).toBeObject()
      expect(todo.completed).toBe(expectedUpdatedTodo.completed)

      expect(user).toBeObject()
      expect(user.points).toBe(0)
      expect(body.error).toBe(false)
      done();

    } catch (err) {
      throw err
    }
  })

  it('Should not award nor forfeit todo value to/from user when todo completed property has not been updated', async (done) => {
    expect.assertions(6)

    let todoUpdates = {
      completed: false,
    }

    try {
      let expectedUpdatedTodo = {
        id: newTodoId,
        ...newTodo,
        ...todoUpdates
      }

      let { status, body } = await reqAgent.patch(`/api/todos/${newTodoId}`).send(todoUpdates)
      const { todo, user } = body.payload
      expect(status).toBe(200)
      expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
      expect(todo).toBeObject()
      expect(todo.completed).toBe(expectedUpdatedTodo.completed)

      // User should not be included when todo completed property didn't change
      expect(user).toBe(undefined)
      expect(body.error).toBe(false)
      done();

    } catch (err) {
      throw err
    }

  })

})
