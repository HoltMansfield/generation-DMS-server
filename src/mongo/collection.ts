import { getDb } from './setup'
import { Collections } from './collections'
let collection

const insertOne = async (document: any) => {
  const result = await collection.insertOne(document)

  // reformat the ID provided by mongo
  const id = document._id
  delete document._id
  document.id = id

  return document
}

const find = async (query: any): Promise<any[]> => {
  const cursor = await collection.find(query)
  const rows = await cursor.toArray()
  const result = rows.map((x) => {
    const id = x._id.toString()
    delete x._id

    return {
      id,
      ...x
    }
  })
  return result
}

const findOne = async (query: any): Promise<any> => {
  const document = await collection.findOne(query)

  if (!document) return document

  const id = document._id.toString()
  delete document._id

  return {
    id,
    ...document
  }
}

const deleteOne = async (query: any): Promise<number> => {
  const result = await collection.deleteOne(query)
  return result.deletedCount
}

export const getCollection = (collectionName: Collections) => {
  const db = getDb()
  collection = db.collection(collectionName)

  return {
    insertOne,
    find,
    findOne,
    deleteOne
  }
}
