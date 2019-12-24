
const { body, validationResult } = require('express-validator');

const newTodoValidators = [
  body('text')
    .trim()
    .notEmpty(),
  body('value')
    .isInt({ min: 1 })
    .trim()
]

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({
        payload: {
          errors: errors.array()
        },
        message: 'Validation error',
        error: true
      })
  } else {
    next()
  }
}

module.exports = {
  newTodoValidators,
  handleValidationErrors
}
