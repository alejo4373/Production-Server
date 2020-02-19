
const { body, oneOf, validationResult } = require('express-validator');
// const validate = require('./validate');
const { flattenErrors } = require('../utils')

const newTodoValidators = [
  body('text')
    .trim()
    .notEmpty(),
  body('value')
    .isInt({ min: 1 })
    .trim()
]

const updateTodoValidators = [
  oneOf([
    body('text').exists().withMessage('not specified'),
    body('value').exists().withMessage('not specified'),
    body('completed').exists().withMessage('not specified')
  ]),
  body('text').optional().trim().notEmpty().withMessage('cannot be empty'),
  body('value').optional().isInt({ min: 1 }).withMessage('must be a valid positive number'),
  body('completed').optional().isBoolean().withMessage('must be true or false')
]

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({
        payload: {
          errors: flattenErrors(errors.array())
        },
        message: 'Validation error/s',
        error: true
      })
  } else {
    next()
  }
}

module.exports = {
  newTodoValidators: [newTodoValidators, handleValidationErrors],
  updateTodoValidators: [updateTodoValidators, handleValidationErrors]
}
