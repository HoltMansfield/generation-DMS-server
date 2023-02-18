import { MongoClient } from 'mongodb'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.plwnqmh.mongodb.net/?retryWrites=true&w=majority`

// Local => `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/`

const client = new MongoClient(uri)
let db

export const connectMongo = async () => {
  try {
    await client.connect()
    console.log('Connected to mongo')
    db = client.db(`${process.env.DB_NAME}`)
    return db
  } catch (e) {
    console.log('*********************')
    console.log(`Message: ${e.message}`)
    console.log('-----')
    console.log(`Stack: ${e.stack}`)
    console.log('-----')
    console.log(`URI: ${uri}`)
  }
}

export const disconnectMongo = async () => {
  try {
    await client.close()
    console.log('Connected to mongo closed')
  } catch {
    // ???
  }
}

export const getDb = () => db
