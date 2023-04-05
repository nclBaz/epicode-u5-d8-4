import Express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import usersRouter from "./users/index.js"
import { forbiddenErrorHandler, genericErroHandler, notFoundErrorHandler, unauthorizedErrorHandler } from "./errorHandlers.js"

const server = Express()
const port = process.env.PORT || 3001

// ************************************* MIDDLEWARES **********************************
server.use(cors())
server.use(Express.json())

// ************************************** ENDPOINTS ***********************************
server.use("/users", usersRouter)

// ************************************* ERROR HANDLERS *******************************
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(notFoundErrorHandler)
server.use(genericErroHandler)

mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected", () => {
  console.log(`✅ Successfully connected to Mongo!`)
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`✅ Server is running on port ${port}`)
  })
})
