const jwt = require('jsonwebtoken')

module.exports = (role) => {
	return (req, res, next) => {
		if (req.method === 'OPTIONS') next()

		try {
			const token = req.headers.authorization.split(' ')[1];
			if (!token) return res.status(401).json({"error": "Not Authorized"})
			req.user = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
			if (!req.user.roles.includes(role)) return res.status(403).json({"error": "Access forbidden"})
			next()
		} catch (e) {
			return res.status(401).json({"error": "Not Authorized"})
		}
	}
}