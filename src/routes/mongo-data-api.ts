import { Express } from 'express'
import axios from 'axios'

const getClient = () => {
  return axios.create({
    baseURL: `https://data.mongodb-api.com/app/data-eykqb/endpoint/data/v1/action/`,
    headers: {
      'Content-Type': 'application/json',
      'api-key': '8xCzOad3SiSyTXC3tdqCF2Ak3KdARPjRVi9Hw8rLQuqVvpBEHbrlhtWD61Y2h1A6'
    }
  })
}

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
      return next(new Error('Not Authorized'))
    }

    const operation = req.body as MongoOperation
    const action = operation.action
    // Mongo isn't expecting this
    delete operation.action

    if (operation.collection === 'users') {
      res.status(401)
      return next(new Error('Not Authorized'))
    }

    const client = getClient()
    let response

    operation.dataSource = 'Cluster0'
    operation.database = 'wmins'

    try {
      response = await client.post(action, operation)
    } catch (e) {
      res.status(500)
      return next(e)
    }

    return res.json(response.data)
  })
}
