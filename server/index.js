const express = require("express")
const router = require("./routers/router")
require('dotenv').config()

const app = express()

app.use('/', router)

app.listen(process.env.PORT, () => console.log('Server started on port: ', process.env.PORT))