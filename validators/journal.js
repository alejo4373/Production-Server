const { query } = require('express-validator')
const withValidationErrorHandler = require('./withValidationErrorHandler')

const getEntriesValidators = withValidationErrorHandler([
  query('date').optional().isISO8601().withMessage('date param format must be YYYY-DD-MM')
])

module.exports = {
  getEntriesValidators
}
