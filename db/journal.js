const { db } = require("./pgp");
const Tags = require('./tags')

const addEntry = async (entry) => {
  const { tags } = entry;
  try {
    const newEntry = await db.one(`INSERT INTO journal_entries(text, owner_id) 
      VALUES($/text/, $/owner_id/) RETURNING *`, entry)

    const existingTags = await Tags.getTagsByName(tags)

    const newTags = tags.filter(tagName => {
      const found = existingTags.find(t => t.name === tagName)
      return !found
    })

    let newInsertedTags = []
    if (newTags.length) {
      newInsertedTags = await Tags.createMultiple(newTags, entry.owner_id)
    }

    let allTags = [...existingTags, ...newInsertedTags]
    await Tags.associateWithJournalEntry(allTags, newEntry.id)

    return {
      ...newEntry,
      tags: allTags
    }
  } catch (err) {
    throw err;
  }
}

const getAllEntries = (owner_id) => {
  return db.any(`SELECT * FROM journal_entries WHERE owner_id = $1`, owner_id)
};

module.exports = {
  addEntry,
  getAllEntries,
};
