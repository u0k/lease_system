const express = require('express')
const bodyParser = require('body-parser')
const { connectToDatabase } = require('./utils/db_connection.js')
const cookieParser = require('cookie-parser')
const app = express()


app.use(bodyParser.json())
app.use(cookieParser())
connectToDatabase()
app.use('/api', require('./routes/auth'))
app.use('/api/user', require('./routes/user'))
app.use('/api/lease', require('./routes/lease'))


module.exports = app