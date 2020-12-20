const { db, helpers, pgpAs, recordNotFound, invalidInteger } = require("./pgp");
const Tags = require("./tags");

const optionalCol = col => ({
  name: col,
  skip: (col) => col.value === null || col.value === undefined || !col.exists
})

const getAllTodos = async (queryParams) => {
  const client_tz = queryParams.client_tz || 'UTC'
  delete queryParams.client_tz // To avoid being used in the whereConditions

  const params = Object.keys(queryParams)
  const timeParams = new Set(['completed_at', 'updated_at', 'due_at'])

  const whereConditions = params.map(param => {
    let columnName = pgpAs.name(param)
    if (timeParams.has(param)) {
      return `(todos.${columnName} AT TIME ZONE $/client_tz/)::Date = $/${param}/` // Type cast to SQL Date AT TIME ZONE to discard time
    } if (param === 'text') {
      return `todos.text_searchable @@ plainto_tsquery($/${param}/)`
    } else {
      return `todos.${columnName} = $/${param}/`
    }
  }).join(' AND ')

  const SQL = `
    SELECT
      todos.*,
      ARRAY_AGG(tags.name) AS tags
    FROM todos 
      LEFT JOIN todos_tags ON todos.id = todos_tags.todo_id
      LEFT JOIN tags ON todos_tags.tag_id = tags.id
    WHERE ${whereConditions}
    GROUP BY todos.id
    ORDER BY created_at DESC
  `

  let todos = await db.any(SQL, {
    ...queryParams,
    client_tz
  });
  return todos
}

const getTodoWithTags = async (id, owner_id) => {
  let todo;
  const SQL = `
    SELECT 
      todos.*,
      ARRAY_AGG(tags.name) AS tags
    FROM todos 
      LEFT JOIN todos_tags ON todos.id = todos_tags.todo_id
      LEFT JOIN tags ON todos_tags.tag_id = tags.id 
    WHERE todos.id = $/id/ AND todos.owner_id = $/owner_id/
    GROUP BY todos.id
  `

  try {
    todo = await db.one(SQL, { id, owner_id });
    if (todo.tags[0] === null) todo.tags = [];
    return todo;
  } catch (err) {
    if (recordNotFound(err) || invalidInteger(err)) {
      todo = null
      return todo;
    }
    throw (err)
  }
}

const getTodosByTags = async (tags) => {
  const variables = tags.map((_, i) => {
    return `$${i + 1}::VARCHAR`
  })

  const SQL = `
    SELECT
      todos.*,
      ARRAY_AGG(tags.name) AS tags
    FROM todos
          JOIN todos_tags ON todos.id = todos_tags.todo_id
          JOIN tags ON todos_tags.tag_id = tags.id
    GROUP BY todos.id
    HAVING ARRAY[${variables.join(', ')}] <@ ARRAY_AGG(tags.name)
  `

  try {
    const todos = await db.any(SQL, tags)
    return todos;
  } catch (err) {
    throw (err)
  }
}

const createTodo = async (todo) => {
  try {
    const newTodo = await db.one(
      `INSERT INTO todos(owner_id, text, value) VALUES($/owner_id/, $/text/, $/value/) 
    RETURNING *`, todo
    )

    if (!todo.tags || !todo.tags.length) {
      todo.tags = ['untagged']
    }

    const existingTags = await Tags.getTagsByName(todo.tags)

    // A better approach for this might be to have tags be unique 
    // by their name and insert the Tags and attempt to insert all Tags
    // and let duplicates fail or take note to create the association only
    // This is not scallable if we have a ton of users creating their own unique tags.
    // All tags need to be loaded into memory.
    const newTags = todo.tags.filter(tagName => {
      const found = existingTags.find(t => t.name === tagName)
      return !found
    })

    let newInsertedTags = [];
    if (newTags.length) {
      newInsertedTags = await Tags.createMultiple(newTags, newTodo.owner_id)
    }

    let allTags = [...existingTags, ...newInsertedTags]
    await Tags.associateWithTodo(allTags, newTodo.id)

    return {
      ...newTodo,
      tags: allTags.map(t => t.name)
    }
  } catch (err) {
    throw err
  }
}

const removeTodo = async (id, owner_id) => {
  let todo;
  try {
    todo = await db.one(`DELETE FROM todos WHERE id = $/id/ AND owner_id = $/owner_id/ 
      RETURNING *`, { id, owner_id });
    return todo;
  } catch (err) {
    if (recordNotFound(err)) {
      todo = false
      return todo;
    }
    throw (err)
  }
}

const updateTodo = async (id, owner_id, todoEdits) => {
  const columnSet = new helpers.ColumnSet([
    optionalCol("text"),
    optionalCol("value")
  ])

  const updateQuery = `
    ${helpers.update(todoEdits, columnSet, 'todos')}
    WHERE todos.id = $/id/ AND owner_id = $/owner_id/
    RETURNING *
  `;

  let todo;
  try {
    todo = await db.one(updateQuery, { id, owner_id })
    return todo
  } catch (err) {
    if (recordNotFound(err) || invalidInteger(err)) {
      todo = null
      return todo;
    }
    throw (err)
  }
}

const toggleCompleted = async (id, owner_id) => {
  try {
    const todo = await getTodoWithTags(id, owner_id);

    if (!todo) return null

    let newCompletedState = todo.completed ? false : true
    const updateQuery = `
      UPDATE todos
      SET 
        completed = ${newCompletedState},
        completed_at = ${newCompletedState ? 'NOW()' : 'NULL'}
      WHERE todos.id = $/id/
      RETURNING *
    `;
    updatedTodo = await db.one(updateQuery, { id })
    return updatedTodo

  } catch (err) {
    if (recordNotFound(err) || invalidInteger(err)) {
      return null
    }
    throw (err)
  }
}

const getTodo = async (todoId, ownerId) => {
  const SQL = 'SELECT * FROM todos WHERE id = $/todoId/ AND owner_id = $/ownerId/'
  try {
    const todo = await db.one(SQL, { todoId, ownerId })
    return todo
  } catch (err) {
    if (recordNotFound(err)) return null
    throw (err)
  }
}

module.exports = {
  getAllTodos,
  getTodo,
  getTodosByTags,
  getTodoWithTags,
  createTodo,
  removeTodo,
  updateTodo,
  toggleCompleted
};
