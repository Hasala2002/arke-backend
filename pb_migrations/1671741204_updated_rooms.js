migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dllc5gtl8i1qpbb")

  // add
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
      "pattern": "/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i"
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dllc5gtl8i1qpbb")

  // remove
  collection.schema.removeField("jjuvwn7e")

  return dao.saveCollection(collection)
})
