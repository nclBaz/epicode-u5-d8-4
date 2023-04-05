import bcrypt from "bcrypt"

const plainPW = "1234567"

const numberOfRounds = 11
// rounds=9 means that the algorithm will be calculated 2^9 --> 512 times
// rounds=10 means that the algorithm will be calculated 2^10 --> 1024 times
// rounds=11 means that the algorithm will be calculated 2^11 --> 2048 times

console.log(
  `Number of rounds: ${numberOfRounds} means that the algorithm will be calculated 2^${numberOfRounds} --> ${Math.pow(2, numberOfRounds)} times`
)
console.time("hash")
const hash = bcrypt.hashSync(plainPW, numberOfRounds) // it's a SALTED HASH
console.timeEnd("hash")

console.log(`Hash: ${hash}`)

const hash2 = bcrypt.hashSync(plainPW, numberOfRounds)
console.log(`Hash2: ${hash2}`)

// Bcrypt does not hash("1234"), instead it does hash("oaeZs/Hb.rTRMiMvmZ5sdO8c1234")
// where "oaeZs/Hb.rTRMiMvmZ5sdO8c" is the SALT (aka random generated string)
// Adding this randomness is making Rainbow Tables useless and therefore attackers will be forced to use Brute Force Attacks

const doTheyMatch = bcrypt.compareSync(plainPW, "$2b$11$0jGHeSrwgbV8EqrvEC7FIeaSX25PfKP9/BoZC8TiCDEMzlrbY6cAa")

console.log("Do they match? ", doTheyMatch)
