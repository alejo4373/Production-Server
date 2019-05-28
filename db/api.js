const { db, helpers } = require("./");
const knex = require('./');
const Todos = knex('todos');

const optionalCol = col => ({
  name: col, 
  skip: (col) => col.value === null || col.value === undefined || !col.exists
})

const getAllTodos = () => Todos.select();
const getTodo = id => Todos.where({id}).select().first();
const removeTodo = id =>  Todos.where({id: parseInt(id)}).del().returning('*');

const updateTodo = (id, todoEdits) => {
  const columnSet = new helpers.ColumnSet([
    optionalCol("text"),
    optionalCol("value"),
    optionalCol("completed"),
  ], { table: "todos" })

  const updateQuery = `${helpers.update(todoEdits, columnSet)} 
    WHERE id = $/id/ RETURNING *`;
  return db.one(updateQuery, {id})
}

module.exports = {
  getAllTodos,
  getTodo,
  removeTodo,
  updateTodo
};
