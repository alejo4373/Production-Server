const { db, helpers, pgpAs, recordNotFound, invalidInteger } = require("./pgp");

const optionalCol = col => ({
  name: col,
  skip: (col) => col.value === null || col.value === undefined || !col.exists
})

const getAllTodos = async (queryParams) => {
  const params = Object.keys(queryParams)
  const whereConditions = params.map(p => {
    let columnName = pgpAs.name(p)
    if (['completed_at', 'updated_at', 'due_at'].includes(p)) {
      columnName += "::Date" // Type cast to SQL Date to discard time
    }
    return `${columnName} = $/${p}/`
  }).join(' AND ')

  const SQL = `
    SELECT * FROM todos 
      WHERE ${whereConditions}
      ORDER BY created_at DESC
  `

  let todos = await db.any(SQL, queryParams);
  return todos
}

const getTodo = async (id, owner_id) => {
  let todo;

  try {
    todo = await db.one("SELECT * FROM todos WHERE id = $/id/ AND owner_id = $/owner_id/", {
      id,
      owner_id
    });
    return todo;
  } catch (err) {
    if (recordNotFound(err) || invalidInteger(err)) {
      todo = null
      return todo;
    }
    throw (err)
  }
}

const createTodo = (todo) => db.one(
  `INSERT INTO todos(owner_id, text, value) VALUES($/owner_id/, $/text/, $/value/) 
    RETURNING *`, todo
)

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
    const todo = await getTodo(id, owner_id);

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

module.exports = {
  getAllTodos,
  getTodo,
  createTodo,
  removeTodo,
  updateTodo,
  toggleCompleted
};
