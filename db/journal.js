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
      tags: allTags.map(t => t.name)
    }
  } catch (err) {
    throw err;
  }
}

const getAllEntries = (params) => {
  const SQL = `
    SELECT 
      je.id, 
      je.text, 
      je.ts, 
      ARRAY_AGG(tags.name) AS tags
    FROM journal_entries AS je
      JOIN je_tags ON je_tags.je_id = je.id
      JOIN tags ON je_tags.tag_id = tags.id
    WHERE je.owner_id = $/owner_id/ ${params.date ? "AND je.ts::Date = $/date/" : ""}
    GROUP BY(je.id)
    ORDER BY(je.ts) DESC
  `
  return db.any(SQL, params)
};

module.exports = {
  addEntry,
  getAllEntries,
};
