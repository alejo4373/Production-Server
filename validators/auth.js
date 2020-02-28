const { body } = require('express-validator');
const withValidationErrorHandler = require('./withValidationErrorHandler');

const loginValidators = withValidationErrorHandler([
  body('username', 'username must not be empty').trim().notEmpty(),
  body('password', 'password must not be empty').trim().notEmpty()
])

const signupValidators = withValidationErrorHandler([
  body('username', 'username must not be empty').trim().notEmpty(),
  body('password', 'password must not be empty').trim().notEmpty(),
  body('email', 'email must be valid').trim().isEmail()
])

module.exports = {
  loginValidators,
  signupValidators
}
