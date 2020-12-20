const { db, recordNotFound, pgpAs } = require("./pgp");
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

const getEntries = async (queryParams) => {
  const client_tz = queryParams.client_tz || "UTC"
  delete queryParams.client_tz

  const params = Object.keys(queryParams)

  const whereConditions = params.map(param => {
    const columnName = pgpAs.name(param)
    if (param === 'date') {
      return `(je.ts AT TIME ZONE $/client_tz/)::Date = $/date/`
    } else if (param === 'text') {
      return `je.text_searchable @@ plainto_tsquery($/text/)`
    } else {
      return `je.${columnName} = $/${param}/`
    }
  })

  const SQL = `
    SELECT 
      je.*,
      ARRAY_AGG(tags.name) AS tags
    FROM journal_entries AS je
      JOIN je_tags ON je_tags.je_id = je.id
      JOIN tags ON je_tags.tag_id = tags.id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY(je.id)
    ORDER BY(je.ts) DESC
  `

  return db.any(SQL, {
    ...queryParams,
    client_tz
  })
};

const getEntry = async (id, owner_id) => {
  const SQL = `
    SELECT
      je.id,
      je.text,
      je.ts,
      ARRAY_AGG(tags.name) AS tags
    FROM journal_entries AS je
      JOIN je_tags ON je_tags.je_id = je.id
      JOIN tags ON je_tags.tag_id = tags.id
    WHERE je.owner_id = $/owner_id/ AND je.id = $/id/
    GROUP BY(je.id)
    ORDER BY(je.ts) DESC
  `
  return db.oneOrNone(SQL, { id, owner_id })
};

const updateEntry = (id, owner_id, updates) => {
  const SQL = `
    UPDATE journal_entries SET text = $/text/
      WHERE id = $/id/ AND owner_id = $/owner_id/
    RETURNING * 
  `
  return db.oneOrNone(SQL, { id, owner_id, ...updates })
}

module.exports = {
  addEntry,
  getEntries,
  updateEntry,
  getEntry
};
