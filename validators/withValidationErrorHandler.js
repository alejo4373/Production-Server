const { validationResult } = require("express-validator");
const { flattenErrors } = require("../utils");

const withValidationErrorsHandler = (validations) => {
  const handler = (req, res, next) => {
    const errors = validationResult(req);
    const errorsArr = errors.array();
    if (!errors.isEmpty()) {
      res.status(422).json({
        payload: {
          errors: flattenErrors(errorsArr),
        },
        message: `Validation error: ${errorsArr[0]?.msg}`,
        error: true,
      });
    } else {
      next();
    }
  };

  return [validations, handler];
};

module.exports = withValidationErrorsHandler;
