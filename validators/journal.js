const { query } = require('express-validator')
const withValidationErrorHandler = require('./withValidationErrorHandler')
const utils = require('../utils')

const getEntriesValidators = withValidationErrorHandler([
  query('date').optional().isISO8601().withMessage('date param format must be YYYY-DD-MM'),
  query('client_tz').optional().custom((value, { req }) => utils.isValidTimeZone(value))
])

module.exports = {
  getEntriesValidators
}
