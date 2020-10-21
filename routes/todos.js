const express = require('express');
const router = express.Router();
const { newTodoValidators, updateTodoValidators, retrieveTodosValidators } = require('../validators/todos');
const { Todos, Users, Tags } = require("../db");
const { loginRequired } = require('../auth/helpers');

router.use(loginRequired)

router.get('/', retrieveTodosValidators, async (req, res, next) => {
  let { user, query } = req

  const queryParams = {
    ...query,
    owner_id: user.id
  }

  try {
    const todos = await Todos.getAllTodos(queryParams);
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

router.post('/', newTodoValidators, async (req, res, next) => {
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

router.get('/byTags', async (req, res, next) => {
  const { tags } = req.query

  try {
    let todos = await Todos.getTodosByTags(tags)
    res.json({
      payload: { todos },
      message: "Retrieved todos by tags",
      error: false
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const owner_id = req.user.id

  try {
    const todo = await Todos.getTodoWithTags(id, owner_id);
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

router.delete('/:id', async (req, res, next) => {
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

router.patch('/:id', updateTodoValidators, async (req, res, next) => {
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

router.post('/:id/toggle-completed', async (req, res, next) => {
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

router.post('/:id/tags', async (req, res, next) => {
  const newTagName = req.body.name
  const todoId = req.params.id
  const userId = req.user.id

  try {
    const todo = await Todos.getTodo(todoId, userId)

    if (!todo) {
      return res.status(404).json({
        payload: null,
        message: "Todo not found",
        error: true
      })
    }

    let tag = await Tags.getTagByName(newTagName)
    if (!tag) {
      tag = await Tags.createTag({
        name: newTagName,
        owner_id: userId
      })
    }

    await Tags.associateWithTodo([tag], todoId)

    res.json({
      payload: {
        addedTag: tag
      },
      message: `Tag \`${tag.name}\` added to todo`,
      error: false
    })

  } catch (err) {
    next(err)
  }
})

router.delete('/:id/tags/:tagName', async (req, res, next) => {
  const todoId = req.params.id
  const { tagName } = req.params
  const userId = req.user.id

  try {
    let removedTag = await Tags.disassociateFromTodo(todoId, tagName, userId)
    if (removedTag) {
      return res.json({
        payload: {
          removedTag: {
            ...removedTag,
            name: tagName
          }
        },
        message: `Tag \`${tagName}\` removed from todo`,
        error: false
      })
    }

    res.status(404).json({
      payload: null,
      message: "Todo or Tag not found",
      error: true
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router;
