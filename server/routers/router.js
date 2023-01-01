const router = require('express')()

router.get('/', (req, res) => {
	res.json({"asd": "something"})
})

module.exports = router