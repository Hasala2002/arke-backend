migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dllc5gtl8i1qpbb")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jjuvwn7e",
    "name": "roomId",
    "type": "text",
    "required": true,
    "unique": true,
    "options": {
      "min": 36,
      "max": 36,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dllc5gtl8i1qpbb")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jjuvwn7e",
    "name": "roomId",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": 36,
      "max": 36,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
