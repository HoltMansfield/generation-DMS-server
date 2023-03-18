import { Express } from 'express'
import bcrypt from 'bcrypt'
import { getClient } from './mongo/get-client'

const { DATA_SOURCE, DB_NAME } = process.env

export const addUserRoutes = (app: Express) => {
  app.post('/users/login', async (req, res, next) => {
    const loginAttempt = req.body

    // Grab the user by email so we can verify the login attempt
    const user = await getClient().post('findOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'users',
      filter: { email: loginAttempt.email }
    })

    // Grab the corresponding userProperties document
    const userProperties = await getClient().post('findOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'userProperties',
      filter: { email: loginAttempt.email }
    })

    const hashedPassword = await bcrypt.hash(loginAttempt.password, user?.data?.document.salt)

    if (hashedPassword !== user?.data?.document.password) {
      res.status(401)
      return next(new Error('Email or Password are incorrect'))
    }

    // scrub user object
    delete user?.data?.document.password
    delete user?.data?.document.salt
    // scrub userProperties object
    delete userProperties?.data?.document._id
    delete userProperties?.data?.document.email

    //@ts-expect-error
    req.session.userId = user?.data?.document._id

    // mere user document with userProperties document
    return res.json({ ...user?.data?.document, userProperties: userProperties?.data?.document })
  })

  app.get('/users/logout', async (req, res) => {
    //@ts-expect-error
    req?.session = null

    return res.json(true)
  })

  app.post('/users', async (req, res, next) => {
    const newUser = req.body
    const newUserProperties = { email: newUser.email }

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

    // create the user document
    const result = await getClient().post('insertOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'users',
      document: newUser
    })

    // create the corresponding userProperties document
    const userPropertiesResult = await getClient().post('insertOne', {
      dataSource: DATA_SOURCE,
      database: DB_NAME,
      collection: 'userProperties',
      document: newUserProperties
    })

    delete newUser.password
    delete newUser.salt
    newUser._id = result.data.insertedId

    //@ts-expect-error
    req.session.userId = newUser._id

    // mere user document with empty userProperties document
    const merged = { ...newUser, userProperties: {} }
    return res.json(merged)
  })

  app.get('/users', async (req, res, next) => {
    //@ts-expect-error
    const query = { _id: { $oid: req?.session?.userId } }
    let user, userProperties

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

    try {
      userProperties = await getClient().post('findOne', {
        dataSource: DATA_SOURCE,
        database: DB_NAME,
        collection: 'userProperties',
        filter: { email: user?.data?.document?.email }
      })
    } catch (e) {
      return next(e)
    }

    // scrub user document
    delete user?.data?.document?.password
    delete user?.data?.document?.salt
    // scrub userPropertiesDocument
    delete userProperties?.data?.document?._id
    delete userProperties?.data?.document?.email

    return res.json({ ...user?.data?.document, userProperties: userProperties?.data?.document })
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

  app.put('/users', async (req, res, next) => {
    const newUser = req.body

    // destruct just the allowed properties

    // update userProperties with same value from email

    return res.json(newUser)
  })
}
