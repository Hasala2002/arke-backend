migrate((db) => {
  const collection = new Collection({
    "id": "dllc5gtl8i1qpbb",
    "created": "2022-12-22 20:15:33.802Z",
    "updated": "2022-12-22 20:15:33.802Z",
    "name": "rooms",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "iyc4ifzy",
        "name": "roomName",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": 5,
          "max": 20,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "bomaa3jd",
        "name": "participants",
        "type": "number",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("dllc5gtl8i1qpbb");

  return dao.deleteCollection(collection);
})
