const xss = require('xss')

const htmlTextSanitizer = () => (req, res, next) => {
  if (req.body && req.body.text) {
    req.body.text = xss(req.body.text)
  }
  next()
}

module.exports = htmlTextSanitizer;
