
const { body, oneOf } = require('express-validator');
const withValidationErrorHandler = require('./withValidationErrorHandler');

const newTodoValidators = withValidationErrorHandler([
  body('text')
    .trim()
    .notEmpty(),
  body('value')
    .isInt({ min: 1 })
    .trim()
])

const updateTodoValidators = withValidationErrorHandler([
  oneOf([
    body('text').exists().withMessage('not specified'),
    body('value').exists().withMessage('not specified'),
    body('completed').exists().withMessage('not specified')
  ]),
  body('text').optional().trim().notEmpty().withMessage('cannot be empty'),
  body('value').optional().isInt({ min: 1 }).withMessage('must be a valid positive number'),
  body('completed').optional().isBoolean().withMessage('must be true or false')
])

module.exports = {
  newTodoValidators,
  updateTodoValidators
}
