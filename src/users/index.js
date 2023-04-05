import express from "express"
import createError from "http-errors"
import UsersModel from "./model.js"
import { JWTAuthMiddleware } from "../lib/auth/jwt.js"
import { adminOnlyMiddleware } from "../lib/auth/admin.js"
import { createTokens, verifyTokensAndCreateNewTokens } from "../lib/auth/tools.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body)
    const { _id } = await newUser.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find({})
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    res.send(updatedUser)
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await UsersModel.findOneAndDelete(req.user._id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.id)
    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:id", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const updatedResource = await UsersModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (updatedResource) {
      res.send(updatedResource)
    } else {
      next(createError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:id", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const deletedResource = await UsersModel.findByIdAndDelete(req.params.id)
    if (deletedResource) {
      res.status(204).send()
    } else {
      next(createError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain credentials from req.body
    const { email, password } = req.body

    // 2. Verify the credentials
    const user = await UsersModel.checkCredentials(email, password)

    if (user) {
      // 3.1 If credentials are fine --> create an access token (JWT) and a refresh Token and send them back as a response

      const { accessToken, refreshToken } = await createTokens(user)

      res.send({ accessToken, refreshToken })
    } else {
      // 3.2 If they are not --> trigger a 401 error
      next(createError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/refreshTokens", async (req, res, next) => {
  try {
    // 1. Obtain the current refresh token from req.body
    const { currentRefreshToken } = req.body

    // 2. Check the validity of that token (check if it's not expired, check if it hasn't been modified, check if it is the same as the one in db)
    // 3. If all the checks are fine --> generate a new pair of tokens (accessToken2 & refreshToken2), also replacing the previous refresh token in db
    const { accessToken, refreshToken } = await verifyTokensAndCreateNewTokens(currentRefreshToken)

    // 4. Send the tokens back as response
    res.send({ accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
})

export default usersRouter
