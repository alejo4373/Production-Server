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

router.get('/entries/:id', async (req, res, next) => {
  const owner_id = req.user.id
  const id = req.params.id

  try {
    const journalEntry = await Journal.getEntry(id, owner_id);

    if (!journalEntry) {
      return res.status(404).json({
        payload: null,
        message: 'Journal Entry not found',
        error: true
      })
    }

    res.json({
      payload: {
        entry: journalEntry
      },
      error: false
    })
  } catch (err) {
    next(err);
  }
})

router.patch('/entries/:id', async (req, res, next) => {
  const owner_id = req.user.id
  const id = req.params.id
  const updates = {
    ...req.body,
  }

  try {
    const updatedEntry = await Journal.updateEntry(id, owner_id, updates);

    if (!updatedEntry) {
      return res.status(404).json({
        payload: null,
        message: 'Journal Entry not found',
        error: true
      })
    }

    res.json({
      payload: {
        updatedEntry
      },
      error: false
    })
  } catch (err) {
    next(err);
  }
})

module.exports = router;
