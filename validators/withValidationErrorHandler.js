const { validationResult } = require('express-validator');
const { flattenErrors } = require('../utils')

const withValidationErrorsHandler = (validations) => {
  const handler = (req, res, next) => {
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

  return [validations, handler]
}

module.exports = withValidationErrorsHandler
