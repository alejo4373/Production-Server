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
    body('completed_at').isISO8601().withMessage('completed_at must be a ISO8601 date string'),
    body('completed').isBoolean().withMessage('completed must be true or false'),
    body('due_at').isISO8601().withMessage('due_at must be a ISO8601 date string'),
    body('text').trim().notEmpty().withMessage('cannot be empty'),
    body('value').isInt({ min: 1 }).withMessage('must be a valid positive number')
  ])
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
