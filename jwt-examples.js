import jwt from "jsonwebtoken"

const secret = "mysup3rs3cr3t"
const payload = { _id: "1oi2j3o1j23oj2i13j", role: "User" }
const options = { expiresIn: "1 week" }

// ************************************* SYNC *************************************

// const token = jwt.sign(payload, secret, options)

// console.log("TOKEN:", token)

// try {
//   const originalPayload = jwt.verify(
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxb2kyajNvMWoyM29qMmkxM2oiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODA2ODIzMjUsImV4cCI6MTY4MTI4NzEyNX0.bkanx56eVEEs8yro0ezrMz6bWpwGAy6Ll1iFiaVnmUU",
//     secret
//   )
//   console.log("PAYLOAD:", originalPayload)
// } catch (error) {
//   console.log("PLEASE LOG IN AGAIN!")
// }

// ************************************* ASYNC *************************************
// jwt.sign(payload, secret, options, (err, token) => {
//   if (err) console.log(err)
//   else {
//     console.log(token)
//     jwt.verify(token, secret, (err, payload) => {
//       console.log(payload)
//     })
//   }
// })

// ****************************** HOW TO CONVERT A CALLBACK BASED FUNCTION INTO A PROMISE BASED FUNCTION (WITHOUT USING PROMISIFY)? ***********************************

const createAccessToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, "mysup3rs3cr3t", { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  ) // Input: payload, Output: Promise which resolves into the token

const verifyAccessToken = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, "mysup3rs3cr3t", (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  ) // Input: token, Output: Promise which resolves into the original payload

// ******************************************* USAGE ****************************

// createAccessToken({})
//   .then(token => {})
//   .catch(err => {})

try {
  const token = await createAccessToken(payload)
  console.log("TOKEN:", token)
  const originalPayload = await verifyAccessToken(token)
  console.log("original payload:", originalPayload)
} catch (error) {
  console.log(error)
}
