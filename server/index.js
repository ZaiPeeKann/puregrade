const express = require("express")
const router = require("./routers/router")
const fileUpload = require("express-fileupload")
require('dotenv').config()

const app = express()

app.use(fileUpload({}))
app.use('/', router)

app.listen(process.env.PORT, () => console.log('Server started on port: ', process.env.PORT))