import { addHeartbeatRoute } from './heartbeat'
import { addDataApiRoutes } from './mongo-data-api'
import { addUserRoutes } from './user'

export const addRoutes = (app) => {
  // no security for these routes
  addUserRoutes(app)
  addHeartbeatRoute(app)

  // cookie required
  addDataApiRoutes(app)
}
