const router = require('express')()
const db = require('../db')

router.get('/', (req, res) => {
	res.json({"asd": "something"})
})

module.exports = router