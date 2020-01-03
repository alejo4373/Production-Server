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

module.exports = {
  flattenErrors
}
