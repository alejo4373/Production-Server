const { body, oneOf, query } = require('express-validator');
const withValidationErrorHandler = require('./withValidationErrorHandler');
const utils = require('../utils');

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
  ]),

  body('text').optional().trim().notEmpty().withMessage('cannot be empty'),
  body('value').optional().isInt({ min: 1 }).withMessage('must be a valid positive number'),
])

const retrieveTodosValidators = withValidationErrorHandler([
  query('completed_at').optional().isISO8601().withMessage('must be in the format YYYY-DD-MM'),
  query('updated_at').optional().isISO8601().withMessage('must be in the format YYYY-DD-MM'),
  query('due_at').optional().isISO8601().withMessage('must be in the format YYYY-DD-MM'),
  query('client_tz').optional().custom((client_tz, { req }) => utils.isValidTimeZone(client_tz)),
  query('completed').optional().isBoolean().withMessage('must be boolean true or false'),
  query('value').optional().isInt().withMessage('must be an integer number'),
])

module.exports = {
  newTodoValidators,
  updateTodoValidators,
  retrieveTodosValidators
}
