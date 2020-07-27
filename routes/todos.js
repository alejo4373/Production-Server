const express = require('express');
const router = express.Router();
const { newTodoValidators, updateTodoValidators, toggleCompleteTodoValidators } = require('../validators/todos');
const { Todos, Users } = require("../db");
const { loginRequired } = require('../auth/helpers');


router.get('/', loginRequired, async (req, res, next) => {
  let { user } = req
  try {
    const todos = await Todos.getAllTodos(user.id);
    res.json({
      payload: {
        todos: todos
      },
      message: "Retrieved all todos",
      error: false
    })
  } catch (err) {
    next(err)
  }
});

router.post('/', loginRequired, newTodoValidators, async (req, res, next) => {
  const { body, user } = req;
  const newTodo = {
    ...body,
    owner_id: user.id
  }

  try {
    const todo = await Todos.createTodo(newTodo);
    res.status(201).json({
      payload: {
        todo: todo
      },
      message: "New Todo created",
      error: false
    })
  } catch (err) {
    next(err)
  }
});

router.get('/:id', loginRequired, async (req, res, next) => {
  const { id } = req.params;
  const owner_id = req.user.id

  try {
    const todo = await Todos.getTodo(id, owner_id);
    if (todo) {
      return res.json({
        payload: {
          todo: todo
        },
        message: "Retrieved single todo",
        error: false
      })
    }

    res.status(404).json({
      payload: null,
      message: "Todo not found",
      error: true
    })
  } catch (err) {
    next(err)
  }
});

router.delete('/:id', loginRequired, async (req, res, next) => {
  const { id } = req.params;
  const owner_id = req.user.id

  try {
    const deletedTodo = await Todos.removeTodo(id, owner_id);
    if (deletedTodo) {
      return res.json({
        payload: {
          todo: deletedTodo,
        },
        message: "Todo deleted",
        error: false
      })
    }

    res.status(404).json({
      payload: null,
      message: "Todo not found",
      error: true
    })
  } catch (err) {
    next(err)
  }
});

router.patch('/:id', loginRequired, updateTodoValidators, async (req, res, next) => {
  const { id } = req.params;
  const owner_id = req.user.id
  const todo_edits = req.body
  try {
    const updatedTodo = await Todos.updateTodo(id, owner_id, todo_edits);

    if (updatedTodo) {
      return res.json({
        payload: {
          todo: updatedTodo,
        },
        message: "Todo updated",
        error: false
      })
    }

    res.status(404).json({
      payload: null,
      message: "Todo not found",
      error: true
    })
  } catch (err) {
    next(err)
  }
});

router.post('/:id/toggle-completed', loginRequired, async (req, res, next) => {
  const { id } = req.params;
  const owner_id = req.user.id

  try {
    const updatedTodo = await Todos.toggleCompleted(id, owner_id);

    if (updatedTodo) {
      let user = await Users.evaluatePoints(owner_id, updatedTodo)

      return res.json({
        payload: {
          todo: updatedTodo,
          user: user
        },
        message: `Todo marked ${updatedTodo.completed ? 'completed' : 'incomplete'}`,
        error: false
      })
    }

    res.status(404).json({
      payload: null,
      message: "Todo not found",
      error: true
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
