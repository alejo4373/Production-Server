const { db, helpers, recordNotFound } = require("./pgp");

const createTag = (newTag) => {
  return db.one(
    'INSERT INTO tags(name, owner_id) VALUES($/name/, $/owner_id/) RETURNING *',
    newTag
  )
}

const getByType = (type, ownerId) => {
  const table = type === 'journal' ? 'je_tags' : 'todos_tags'
  const SQL = `
    SELECT DISTINCT
      tags.id,
      name
    FROM tags
    JOIN ${table} ON tags.id = ${table}.tag_id
    WHERE tags.owner_id = $1
  `
  return db.any(SQL, ownerId)
}

const createMultiple = (tags, owner_id) => {
  let query = 'INSERT INTO tags(name, owner_id) VALUES'

  tags.forEach((tag, i) => {
    query += `($${i + 1}, ${owner_id}),`
  })

  query = query.slice(0, -1) // Remove last comma
  query += ' RETURNING *'

  return db.any(query, tags)
}

const getTagsByName = (tags) => {
  return db.any('SELECT * FROM tags WHERE tags.name IN ($1:csv)', [tags])
}

const getTagByName = (tag) => {
  return db.oneOrNone('SELECT * FROM tags WHERE tags.name = $1', [tag])
}

const associateWithJournalEntry = (tags, journalEntryId) => {
  const values = tags.map(tag => ({
    'tag_id': tag.id,
    'je_id': journalEntryId
  }))

  const columnSet = new helpers.ColumnSet(['je_id', 'tag_id'], { table: 'je_tags' })
  const query = helpers.insert(values, columnSet)

  return db.none(query)
}

const associateWithTodo = (tags, todoId) => {
  const values = tags.map(tag => ({
    'tag_id': tag.id,
    'todo_id': todoId
  }))

  const columnSet = new helpers.ColumnSet(['todo_id', 'tag_id'], { table: 'todos_tags' })
  const query = helpers.insert(values, columnSet)

  return db.none(query)
}

const disassociateFromTodo = async (todoId, tagName, ownerId) => {
  const SQL = `
    DELETE FROM todos_tags
    WHERE 
      todo_id = (SELECT id FROM todos WHERE id = $/todoId/ AND owner_id = $/ownerId/)
        AND
      tag_id = (SELECT id FROM tags WHERE name = $/tagName/)
      RETURNING *
  `

  try {
    const removedTag = await db.one(SQL, { todoId, tagName, ownerId })
    return removedTag
  } catch (err) {
    if (recordNotFound(err)) {
      return false
    }
    throw (err)
  }

}

module.exports = {
  createTag,
  getTagsByName,
  getTagByName,
  getByType,
  associateWithJournalEntry,
  associateWithTodo,
  disassociateFromTodo,
  createMultiple
};
