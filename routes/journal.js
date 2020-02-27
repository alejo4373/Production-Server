const express = require('express');
const router = express.Router();
const { Journal } = require("../db")
const { loginRequired } = require("../auth/helpers")

router.post('/entries', loginRequired, async (req, res, next) => {
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

router.get('/entries', loginRequired, async (req, res, next) => {
  let owner_id = req.user.id
  try {
    const entries = await Journal.getAllEntries(owner_id);
    res.json({
      payload: entries,
      error: false
    })
  } catch (err) {
    next(err);
  }
})
module.exports = router;
