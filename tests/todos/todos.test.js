const app = require('../../app');
const request = require('supertest')
const helpers = require('../helpers')

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
    expect.assertions(11)

    reqAgent
      .post('/api/todos')
      .send(testTodo)
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;
        const { todo } = body.payload;

        expect(status).toBe(201)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(todo).toBeObject()
        expect(todo.id).toBe(expectedTodo.id)
        expect(todo.text).toBe(expectedTodo.text)
        expect(todo.value).toBe(expectedTodo.value)
        expect(todo.completed).toBe(expectedTodo.completed)
        expect(todo.owner_id).toBe(expectedTodo.owner_id)
        expect(new Date(todo.created_at)).toBeValidDate()
        expect(new Date(todo.updated_at)).toBeValidDate()
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
      promises.push(reqAgent.post('/api/todos').send(todos[todo]))
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
    expect.assertions(11)

    reqAgent
      .get('/api/todos/1')
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;
        const { todo } = body.payload;

        expect(status).toBe(200)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(todo).toBeObject()
        expect(todo.id).toBe(expectedTodo.id)
        expect(todo.text).toBe(expectedTodo.text)
        expect(todo.value).toBe(expectedTodo.value)
        expect(todo.completed).toBe(expectedTodo.completed)
        expect(todo.owner_id).toBe(expectedTodo.owner_id)
        expect(new Date(todo.created_at)).toBeValidDate()
        expect(new Date(todo.updated_at)).toBeValidDate()
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

  it('Should delete a todo by id', (done) => {
    expect.assertions(11)

    reqAgent
      .delete('/api/todos/1')
      .end((err, res) => {
        if (err) {
          console.log('ERROR', err)
          throw err
        }

        const { status, body } = res;
        const { todo } = body.payload

        expect(status).toBe(200)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(todo).toBeObject()
        expect(todo.id).toBe(expectedTodo.id)
        expect(todo.text).toBe(expectedTodo.text)
        expect(todo.value).toBe(expectedTodo.value)
        expect(todo.completed).toBe(expectedTodo.completed)
        expect(todo.owner_id).toBe(expectedTodo.owner_id)
        expect(new Date(todo.created_at)).toBeValidDate()
        expect(new Date(todo.updated_at)).toBeValidDate()
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
      promises.push(reqAgent.post('/api/todos').send(todos[todo]))
    }

    try {
      await Promise.all(promises);
      const res = await reqAgent.get('/api/todos')
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
    expect.assertions(33)

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
      const newTodoResponse = await reqAgent.post('/api/todos').send(testTodo)
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
        expect(previousTodo).toBeObject()
        expect(previousTodo.id).toBe(expectedUpdatedTodo.id)
        expect(previousTodo.text).toBe(expectedUpdatedTodo.text)
        expect(previousTodo.value).toBe(expectedUpdatedTodo.value)
        expect(previousTodo.completed).toBe(expectedUpdatedTodo.completed)
        expect(previousTodo.owner_id).toBe(expectedUpdatedTodo.owner_id)
        expect(new Date(previousTodo.created_at)).toBeValidDate()
        expect(new Date(previousTodo.updated_at)).toBeValidDate()
        expect(body.error).toBe(false)
      }
      done();
    } catch (err) {
      throw err
    }
  })

  it('Should prevent updating a todo with invalid property values', async (done) => {
    expect.assertions(30)

    const todoUpdates = {
      invalidValueAndInvalidText: {
        value: -10,
        text: "\n \t "
      },
      invalidValueAndValidText: {
        value: 0,
        text: "Hello"
      },
      validValueAndInvalidText: {
        value: 111,
        text: '\n \n'
      },
      missingValueAndMissingText: {
      },
      missingValueAndInvalidText: {
        text: "   "
      },
      invalidValueAndMissingText: {
        value: "123abc"
      }
    }

    try {
      // Add test todo
      const newTodoResponse = await reqAgent.post('/api/todos').send(testTodo)
      const newTodo = newTodoResponse.body.payload.todo

      let errorsLength;
      for (let update in todoUpdates) {
        switch (update) {
          case "invalidValueAndInvalidText":
            errorsLength = 2
            break
          case "missingValueAndMissingText":
            errorsLength = 3
            break
          case "invalidValueAndValidText":
          case "validValueAndInvalidText":
          case "invalidValueAndMissingText":
          case "missingValueAndInvalidText":
            errorsLength = 1
            break
        }

        const { status, body } = await reqAgent.patch(`/api/todos/${newTodo.id}`).send(todoUpdates[update])
        previousTodo = body.payload.todo
        expect(status).toBe(422)
        expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
        expect(body.message).toMatch(/validation error/i)
        expect(body.error).toBe(true)
        expect(body.payload.errors).toBeArrayOfSize(errorsLength)
      }
      done();
    } catch (err) {
      throw err;
    }
  })

  it('Should return 404 when updating a todo\'s that doesn\'t exist', async (done) => {
    expect.assertions(4)

    const todoUpdates = {
      value: 987,
      text: "Organize desk"
    }

    try {
      const { status, body } = await reqAgent.patch(`/api/todos/123abc`).send(todoUpdates)
      expect(status).toBe(404)
      expect(body).toContainKeys(helpers.RESPONSE_PROPERTIES)
      expect(body.payload).toBe(null)
      expect(body.error).toBe(true)
      done();
    } catch (err) {
      throw err
    }
  })
})
