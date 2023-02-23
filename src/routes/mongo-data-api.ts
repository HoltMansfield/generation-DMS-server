import { Express } from 'express'
import { getClient } from './mongo/get-client'

interface MongoOperation {
  action: string
  collection: string
  dataSource: string
  database: string
  document?: object
}

export const addDataApiRoutes = (app: Express) => {
  app.post('/data-api', async (req, res, next) => {
    //@ts-expect-error
    if (!req?.session?.userId) {
      res.statusCode = 401
      return next(new Error('Not Authorized for DMS Access'))
    }

    const operation = req.body as MongoOperation
    const action = operation.action
    // Mongo isn't expecting this
    delete operation.action

    if (operation.collection === 'users') {
      res.status(401)
      return next(new Error("Not Authorized for collection 'users' use the userProperties collection"))
    }

    const client = getClient()
    let response
    const { DATA_SOURCE, DB_NAME } = process.env

    operation.dataSource = DATA_SOURCE
    operation.database = DB_NAME

    try {
      response = await client.post(action, operation)
    } catch (e) {
      res.status(500)
      return next(e)
    }

    return res.json(response.data)
  })
}
