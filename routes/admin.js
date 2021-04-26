const express = require('express')

const adminRouter = express.Router()
adminRouter.get('/', (req, res) => {
    res.send('teste do admin')
})

module.exports = adminRouter