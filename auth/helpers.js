const bcrypt = require('bcrypt');
const axios = require('axios')

const genPasswordDigest = async (plainPassword) => {
  try {
    let passwordDigest = await bcrypt.hash(plainPassword, 10);
    return passwordDigest;
  }
  catch (err) {
    throw (err)
  }
}

const verifyCaptchaToken = async (req, res, next) => {
  const secret = process.env.RECAPTCHA_SECRET
  const token = req.body.recaptchaToken
  try {
    const URL = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    const { data } = await axios.post(URL)
    console.log('captcha validation:', data);
    if (data.success) {
      next()
    } else {
      next(new Error('captcha validation failed'))
    }
  } catch (err) {
    next(err)
  }
}

const comparePasswords = (plainPassword, passwordDigest) => {
  return bcrypt.compare(plainPassword, passwordDigest)
}

const loginRequired = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({
    payload: {
      message: "Unauthorized"
    },
    error: true
  })
}

module.exports = {
  genPasswordDigest,
  comparePasswords,
  loginRequired,
  verifyCaptchaToken
}
