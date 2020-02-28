const { body } = require('express-validator');
const withValidationErrorHandler = require('./withValidationErrorHandler');

const loginValidators = withValidationErrorHandler([
  body('username', 'Username must be present and not be empty').notEmpty(),
  body('password', 'Password must be present and not be empty').notEmpty()
])

module.exports = {
  loginValidators
}
