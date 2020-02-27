const express = require('express');
const router = express.Router();
const { Tags } = require("../db");
const { loginRequired } = require("../auth/helpers");

router.post('/', loginRequired, async (req, res, next) => {
  const newTag = {
    name: req.body.name,
    owner_id: req.user.id
  }

  try {
    const tagCreated = await Tags.createTag(newTag);
    res.json({
      payload: tagCreated,
      error: false
    })
  } catch (err) {
    next(err);
  }
})

module.exports = router;
