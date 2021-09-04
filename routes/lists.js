const express = require('express');
const router = express.Router();
const { Lists } = require("../db");
const { loginRequired } = require("../auth/helpers");

router.post('/', loginRequired, async (req, res, next) => {
  const newList = {
    name: req.body.name,
    owner_id: req.user.id
  }

  try {
    const listCreated = await Lists.createList(newList);
    res.json({
      payload: { list: listCreated },
      error: false
    })
  } catch (err) {
    next(err);
  }
})

router.get('/', loginRequired, async (req, res, next) => {
  const ownerId = req.user.id

  try {
    const lists = await Lists.getAll(ownerId);
    res.json({
      payload: { lists },
      error: false
    })
  } catch (err) {
    next(err);
  }
})

module.exports = router;
