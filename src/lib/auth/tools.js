import jwt from "jsonwebtoken"
import UsersModel from "../../users/model.js"
import createHttpError from "http-errors"

export const createTokens = async user => {
  // 1. Given the user, it creates 2 tokens (access & refresh)
  const accessToken = await createAccessToken({ _id: user._id, role: user.role })
  const refreshToken = await createRefreshToken({ _id: user._id })

  // 2. Refresh Token should be saved in db
  user.refreshToken = refreshToken
  await user.save()

  // 3. Return the tokens
  return { accessToken, refreshToken }
}

export const createAccessToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  ) // Input: payload, Output: Promise which resolves into the token

export const verifyAccessToken = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  ) // Input: token, Output: Promise which resolves into the original payload

const createRefreshToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "1 day" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

const verifyRefreshToken = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.REFRESH_SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  )

export const verifyTokensAndCreateNewTokens = async currentRefreshToken => {
  try {
    // 1. Check the integrity and expiration date of current refresh token. We gonna catch potential errors
    const { _id } = await verifyRefreshToken(currentRefreshToken)

    // 2. If the token is valid, we have to compare it with the one we have in db
    const user = await UsersModel.findById(_id)
    if (!user) throw new createHttpError(404, `User with id ${_id} not found!`)

    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      // 3. If everything is fine --> create 2 new tokens (saving refresh in db)
      const { accessToken, refreshToken } = await createTokens(user)

      // 4. Return tokens
      return { accessToken, refreshToken }
    } else {
      throw new createHttpError(401, "Refresh token not valid!")
    }
  } catch (error) {
    throw new createHttpError(401, "Please log in again!")
  }
}
