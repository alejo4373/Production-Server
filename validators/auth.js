const { body } = require('express-validator');
const withValidationErrorHandler = require('./withValidationErrorHandler');

const loginValidators = withValidationErrorHandler([
  body('username', 'Username must be present and not be empty').notEmpty(),
  body('password', 'Password must be present and not be empty').notEmpty()
])

const signupValidators = withValidationErrorHandler([
  body('username', 'username must not be empty').notEmpty(),
  body('password', 'password must not be empty').notEmpty(),
  body('email', 'email must be valid').isEmail()
])

module.exports = {
  loginValidators,
  signupValidators
}
