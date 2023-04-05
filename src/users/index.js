import express from "express"
import createError from "http-errors"
import UsersModel from "./model.js"
import { basicAuthMiddleware } from "../lib/auth/basic.js"
import { adminOnlyMiddleware } from "../lib/auth/admin.js"

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

usersRouter.get("/", basicAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find({})
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    res.send(updatedUser)
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    await UsersModel.findOneAndDelete(req.user._id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:id", basicAuthMiddleware, async (req, res, next) => {
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

usersRouter.put("/:id", basicAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
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

usersRouter.delete("/:id", basicAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
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

export default usersRouter
