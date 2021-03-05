const sanitizeHtml = require('sanitize-html')

const htmlTextSanitizer = () => (req, res, next) => {
  if (req.body && req.body.text) {
    req.body.text = sanitizeHtml(req.body.text, { disallowedTagsMode: 'scape' })
  }
  next()
}

module.exports = htmlTextSanitizer;
