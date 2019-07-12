const express = require('express');
const router = express.Router();
const db = require("../db/api");

router.post('/add', async (req, res, next) => {
  try {
    const journalEntry = await db.addJournalEntry(req.body);
    res.json({
      payload: journalEntry,
      err: false
    })
  } catch (err) {
    next(err);
  }
})

module.exports = router;