const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

let dbPath = path.join(__dirname, 'userData.db')
let db = null

const initilizeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('success'))
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initilizeServerAndDb()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  let hashPassword = await bcrypt.hash(password, 10)

  let checkUsername = `
    SELECT 
    FROM 
    user 
    WHERE 
    username = ${username}`

  const userDb = await db.run(checkUsername)

  if (userDb === undefined) {
    let postNewUserQuery = `
        INSERT INTO 
         user(username,name,password,gender,location)
        values
        '${username}','${name}','${password}','${gender}','${location}'
        
        `
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      newUserDetails = await db.run(postNewUserQuery)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `
  SELECT * FROM user WHERE username = ${username}`
  const dbUser = await db.run(selectUserQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isMatchedPassword = await bcrypt.compare(password, dbUser.password)

    if (isMatchedPassword === true) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid user')
    }
  }
})

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const checkUserQuery = `
  SELECT * FROM user WHERE username = ${username}`
  if (checkUserQuery === undefined) {
    response.status(400)
    response.send('User not registered')
  } else {
    const isMatchedPassword = await bcrypt.compare(password, dbUser.password)
    if (isMatchedPassword === true) {
      const lengthOfNewPassword = newPassword.lengt
      if (lengthOfNewPassword < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatePasswordQuery = `
        update user
        set password = '${encryptedPassword}',
        WHERE username = '${username}'`
        await db.run(updatePasswordQuery)
        response.status(200)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})

module.exports = app
