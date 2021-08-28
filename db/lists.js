const { db } = require("./pgp");

const createList = (newList) => {
  return db.one(
    'INSERT INTO lists(name, owner_id) VALUES($/name/, $/owner_id/) RETURNING *',
    newList
  )
}

const getAll = (ownerId) => {
  return db.any('SELECT * FROM lists WHERE owner_id = $1', ownerId)
}


module.exports = {
  createList,
  getAll,
};
