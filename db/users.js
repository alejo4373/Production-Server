const { db, recordNotFound } = require('./pgp');

const createUser = async (user) => {
  try {
    let insertQuery = `
      INSERT INTO users(username, email, password_digest, points)
      VALUES($/username/, $/email/, $/password_digest/, $/points/) RETURNING *
    `
    let newUser = await db.one(insertQuery, user)
    return newUser;
  } catch (err) {
    throw err;
  }
}

const getUserByUsername = async (username) => {
  try {
    let user = await db.one('SELECT * FROM users WHERE username = $/username/', {
      username
    });
    return user;
  } catch (err) {
    if (recordNotFound(err)) {
      return false;
    }
    throw err;
  }
}

const getUserById = async (id) => {
  try {
    let user = await db.one('SELECT * FROM users WHERE id = $1', id);
    return user;
  } catch (err) {
    throw err;
  }
}

const evaluatePoints = async (userId, updatedTodo) => {
  const { completed, previously_completed, value } = updatedTodo
  const award = completed && !previously_completed

  let updateQuery = `
    UPDATE users 
    SET points = points ${award ? '+' : '-'} $/value/ 
    WHERE id = $/userId/ RETURNING *
  `

  try {
    let user = await db.one(updateQuery, { userId, value })
    delete user.password_digest
    return user;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  evaluatePoints
}
