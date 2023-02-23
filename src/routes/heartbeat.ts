import { Express } from 'express'

export const addHeartbeatRoute = (app: Express) => {
  app.get('/', async (_, res) => {
    const message = `Running: ${new Date().toDateString()} on port #: ${process.env.PORT}`
    res.send(message)
  })
}
