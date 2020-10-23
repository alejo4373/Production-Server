const express = require('express');
const router = express.Router();
const { Journal } = require("../db")
const { loginRequired } = require("../auth/helpers");
const { getEntriesValidators } = require('../validators/journal');

router.use(loginRequired)

router.post('/entries', async (req, res, next) => {
  const newEntry = {
    ...req.body,
    owner_id: req.user.id
  }

  try {
    const entry = await Journal.addEntry(newEntry);
    res.json({
      payload: entry,
      error: false
    })
  } catch (err) {
    next(err);
  }
})

router.get('/entries', getEntriesValidators, async (req, res, next) => {
  const params = {
    owner_id: req.user.id,
    ...req.query
  }
  try {
    const entries = await Journal.getEntries(params);
    res.json({
      payload: entries,
      error: false
    })
  } catch (err) {
    next(err);
  }
})

module.exports = router;
