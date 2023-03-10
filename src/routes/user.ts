import { Express } from 'express'
import bcrypt from 'bcrypt'
import { getClient } from './mongo/get-client'

const { DATA_SOURCE, DB_NAME } = process.env

export const addUserRoutes = (app: Express) => {
  app.post('/users/login', async (req, res, next) => {
    const loginAttempt = req.body

    const user = await getClient().post('findOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'users',
      filter: { email: loginAttempt.email }
    })

    const hashedPassword = await bcrypt.hash(loginAttempt.password, user?.data?.document.salt)

    if (hashedPassword !== user?.data?.document.password) {
      res.status(401)
      return next(new Error('Email or Password are incorrect'))
    }

    delete user?.data?.document.password
    delete user?.data?.document.salt

    //@ts-expect-error
    req.session.userId = user?.data?.document._id

    return res.json(user?.data?.document)
  })

  app.get('/users/logout', async (req, res) => {
    //@ts-expect-error
    req?.session = null

    return res.json(true)
  })

  app.post('/users', async (req, res, next) => {
    const newUser = req.body

    const existingUser = await getClient().post('findOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'users',
      filter: { email: newUser.email }
    })

    if (existingUser?.data?.document) {
      res.statusCode = 422
      return next(new Error('Email in use'))
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newUser.password, salt)
    newUser.password = hashedPassword
    newUser.salt = salt

    const result = await getClient().post('insertOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'users',
      document: newUser
    })

    delete newUser.password
    delete newUser.salt
    newUser._id = result.data.insertedId

    //@ts-expect-error
    req.session.userId = newUser._id

    return res.json(newUser)
  })

  app.get('/users', async (req, res, next) => {
    //@ts-expect-error
    const query = { _id: { $oid: req?.session?.userId } }
    let user

    try {
      user = await getClient().post('findOne', {
        dataSource: DATA_SOURCE,
        database: DB_NAME,
        collection: 'users',
        filter: query
      })
    } catch (e) {
      return next(e)
    }

    delete user?.data?.document?.password
    delete user?.data?.document?.salt

    return res.json(user?.data?.document)
  })

  app.delete('/users/:userId', async (req, res, next) => {
    //@ts-expect-error
    if (req.params.userId !== req?.session?.userId) {
      res.statusCode = 401
      return next(new Error('Not Authorized'))
    }
    //@ts-expect-error
    const query = { _id: { $oid: req?.session?.userId } }

    const result = await getClient().post('deleteOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'users',
      filter: query
    })

    if (result?.data?.deletedCount === 0) {
      return next(new Error('User not found'))
    }

    return res.json({ userId: req.params.userId })
  })
}
