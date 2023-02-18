import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieSession from 'cookie-session'
import { connectMongo } from './mongo/setup'
import { addUserRoutes } from './routes/user'
import { handleApiError } from './server/error-handling/error-handler'
import { addDataApiRoutes } from './routes/mongo-data-api'

const run = async () => {
  await connectMongo()
  const app = express()

  // pre-endpoint middleware
  app.use(bodyParser.json())
  app.use(cookieSession({ secret: 'manny is cool' }))
  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:5173'
    })
  )

  // no security for these routes
  addUserRoutes(app)

  // cookie required
  addDataApiRoutes(app)

  // post-endpoint middleware (error handler always last)
  app.use(handleApiError)

  app.listen(4000, () => {
    console.log('Listening at http://localhost:4000...')
  })
}

run()
