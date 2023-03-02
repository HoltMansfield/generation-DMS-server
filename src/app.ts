import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieSession from 'cookie-session'
import { handleApiError } from './server/error-handling/error-handler'
import { addRoutes } from './routes/add-routes'

const run = async () => {
  const app = express()

  // pre-endpoint middleware
  app.use(bodyParser.json())
  app.use(cookieSession({ secret: 'manny is cool' }))
  app.use(
    cors({
      credentials: true,
      origin: function (origin, callback) {
        /*
          Using this function for origin I can support any origin and also use cookies
          you can't use '*' and cookies
        */
        callback(null, true)
      }
    })
  )

  addRoutes(app)

  // post-endpoint middleware (error handler always last)
  app.use(handleApiError)

  app.listen(process.env.PORT, () => {
    console.log(`Listening at http://localhost:${process.env.PORT}...`)
  })
}

run()
