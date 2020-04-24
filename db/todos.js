const { db, helpers, recordNotFound, invalidInteger } = require("./pgp");

const optionalCol = col => ({
  name: col,
  skip: (col) => col.value === null || col.value === undefined || !col.exists
})

const getAllTodos = (owner_id) => db.any("SELECT * FROM todos WHERE owner_id = $1 ORDER BY created_at DESC", owner_id);

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
    optionalCol("value"),
    optionalCol("completed")
  ])

  // I needed a way to tell when a todo moved from completed=true to completed=false
  // and vise versa because I need to award points if moving from incomplete to 
  // completed and take away points if moving from completed to incomplete.
  // I didn't want to have to fire another DB query before the update to then
  // remember the previous completed state of the todo and compare it to the new
  // state. I wanted to see if there was a way to do it directly on PostgresSQL
  // and found the resources bellow helpful.
  // https://stackoverflow.com/a/7927957/8662171
  // https://www.postgresql.org/docs/9.4/explicit-locking.html

  const updateQuery = `
    ${helpers.update(todoEdits, columnSet, 'todos')}
    FROM (
      SELECT id, completed AS previously_completed
      FROM todos
      WHERE id = $/id/ FOR UPDATE 
    ) AS todos_b
    WHERE todos.id = todos_b.id
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

module.exports = {
  getAllTodos,
  getTodo,
  createTodo,
  removeTodo,
  updateTodo,
};
