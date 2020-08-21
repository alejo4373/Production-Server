const { db } = require('./db/pgp');
const flattenErrors = (errors) => {
  const out = [];
  const stack = [];

  for (let err of errors) {
    stack.push(err)
    while (stack.length) {
      let elem = stack.pop()
      if (elem.nestedErrors) {
        for (let i = elem.nestedErrors.length - 1; i >= 0; i--) {
          stack.push(elem.nestedErrors[i])
        }
      } else {
        out.push(elem)
      }
    }
  }
  return out;
}

const isValidTimeZone = async (timezone) => {
  try {
    await db.one("SELECT name from pg_timezone_names WHERE name = $1", timezone)
  } catch (err) {
    throw new Error('Invalid timezone. Use a valid IANA timezone or UTC')
  }
}

module.exports = {
  flattenErrors,
  isValidTimeZone
}
