const router = require('express')()
const db = require('../db')

router.get('/', (req, res) => {
	const { command } = req.body
	res.json({"asd": "something"})
})

module.exports = router