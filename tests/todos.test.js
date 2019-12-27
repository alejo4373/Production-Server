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

  it('Should prevent adding a todo with invalid text or value properties', async (done) => {
    expect.assertions(12)

    const todos = {
      invalidValue: {
        value: -1,
      },
      invalidText: {
        text: "   \n"
      },
      invalidValueAndText: {
        value: "0b",
        text: " \r\t"
      }
    }


    let promises = []

    for (let todo in todos) {
      promises.push(reqAgent.post('/api/todos/new').send(todos[todo]))
    }

    try {
      let responses = await Promise.all(promises);

      for (let res of responses) {
        const { status, body } = res;

        expect(status).toBe(422)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.message).toMatch(/validation error/i)
        expect(body.error).toBe(true)
      }
      done();
    } catch (err) {
      throw err
    }
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

  it('Should return appropriate error when todo by id not found', (done) => {
    expect.assertions(4)

    reqAgent
      .get('/api/todos/zzz')
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;

        expect(status).toBe(404)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.payload).toBe(null)
        expect(body.error).toBe(true)

        done();
      })
  })

  it('Should delete a todo todo by id', (done) => {
    expect.assertions(4)

    reqAgent
      .delete('/api/todos/1')
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

  it('Should return error when trying to delete a not-found todo by id', (done) => {
    expect.assertions(4)

    reqAgent
      .delete('/api/todos/1')
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;

        expect(status).toBe(404)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.payload).toBe(null)
        expect(body.error).toBe(true)

        done();
      })
  })

  it('Should successfully retrieve all todos', async (done) => {
    expect.assertions(4)

    const todos = [
      { value: 100, text: "Do Laundry" },
      { value: 1, text: "Buy Salt" },
      { value: 999, text: "Mop floors" }
    ]

    let promises = []

    for (let todo in todos) {
      promises.push(reqAgent.post('/api/todos/new').send(todos[todo]))
    }

    try {
      await Promise.all(promises);
      const res = await reqAgent.get('/api/todos/all')
      const { status, body } = res;

      expect(status).toBe(200)
      expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
      expect(body.payload.todos).toBeArrayOfSize(3)
      expect(body.error).toBe(false)

      done();
    } catch (err) {
      console.log('ERROR', err)
      throw err
    }
  })

  it('Should allow updating a todo\'s value and text properties. Both at once or one at a time', async (done) => {
    expect.assertions(12)

    const todos = {
      updatingValue: {
        value: 123,
      },
      updatingText: {
        text: "Buy new boots"
      },
      updatingBoth: {
        value: 987,
        text: "Organize desk"
      }
    }

    const todoUpdates = [todos.updatingValue, todos.updatingText, todos.updatingBoth]

    try {
      // Add test todo
      const newTodoResponse = await reqAgent.post('/api/todos/new').send(testTodo)
      const newTodo = newTodoResponse.body.payload.todo
      let previousTodo = newTodo;

      for (let update of todoUpdates) {
        const expectedUpdatedTodo = {
          ...previousTodo,
          ...update
        }

        const { status, body } = await reqAgent.patch(`/api/todos/${newTodo.id}`).send(update)
        previousTodo = body.payload.todo
        expect(status).toBe(200)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.payload.todo).toEqual(expectedUpdatedTodo)
        expect(body.error).toBe(false)
      }
      done();
    } catch (err) {
      throw err
    }
  })

  it.todo('Should return 404 when updating a todo\'s that doesn\'t exist')
  it.todo('Should reward user when todo is user when todo is completed')
  it.todo('Should prevent updating a todo with invalid property values')
})
