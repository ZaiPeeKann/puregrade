const db = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

class UserController {
	async registration(req, res) {
		try {
			const {email, password, nickname} = req.body
			if (!email || !password || !nickname) return res.status(400).json({"error": "Not enough data"})
			const role = "USER"
			const candidate = await db.query(`select * from users where email = $1`, [email])
			if (candidate.rows[0]) {
				return res.status(401).json({"error": "email already in use"})
			}

			const hashpass = await bcrypt.hash(password, 3)
			const user = await db.query(`insert into users (email, password, nickname, created_at) values ($1, $2, $3, $4) returning *`, [email, hashpass, nickname, Date.now()])
			const token = jwt.sign({id: user.id, email, role}, process.env.JWT_PRIVATE_KEY, {expiresIn: '24h'})

			return res.status(200).json({token})
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async getOne(req, res) {
		try {
			const {id} = req.body
			const user = await db.query(`select users.nickname, users.email, users.avatar, users.banned, users.status, roles.title from users where id = $1 left outer join user_role on user.id = user_role.user_id left outer join roles on roles.id = user_role.role_id`, [id])

			if (!user.rows[0]) return res.status(404).json({"error": "User not found"})

			return res.status(200).json(user.rows[0])
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async getAll(req, res) {
		try {
			let {limit, offset} = req.body
			if (!limit) limit = -1
			if (!offset) offset = 0
			const user = await db.query(`select users.nickname, users.email, users.avatar, users.banned, users.status, roles.title from users left outer join user_role on user.id = user_role.user_id left outer join roles on roles.id = user_role.role_id limit $1, $2`, [limit, offset])

			if (!user.rows) return res.status(404).json({"error": "Users not found"})

			return res.status(200).json(user.rows)
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async login(req, res) {
		try {
			const {email, password} = req.body
			if (!email || !password) return res.status(400).json({"error": "Not enough data"})

			const user = await db.query(`select users.nickname, users.email, users.avatar, users.banned, users.status, roles.title from users where email = $1 left outer join user_role on user.id = user_role.user_id left outer join roles on roles.id = user_role.role_id`, [email])

			if (!user) return res.status(404).json({"error": "User not exists"})
			if (!bcrypt.compareSync(password, user.password)) return res.status(404).json({"error": "Wrong password"})

			const token = jwt.sign({id: user.rows[0].id, email, roles: user.roles}, process.env.JWT_PRIVATE_KEY, {expiresIn: '24h'})

			return res.statud(200).json({token})
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async delete(req, res) {
		try	{
			const {id} = req.body
			await db.query(`delete from users where id = $1`, [id])
			return res.status(200)
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async ban(req, res) {
		try {
			const {id, state} = req.body

			await db.query(`update users set ban = $2 where id = $1`, [id, state])

			return res.status(200)
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async comment(req, res) {
		try {
			const {body, author_id, review_id, comment_id} = req.body
			if (!body || !author_id || !review_id || !comment_id) return res.status(401).json({"error": "Not enough data"})

			const candidate = await db.query(`select banned from users where id = $1`, [author_id])
			if (candidate.rows[0].banned) return res.status(403).json({"error": "User is banned"})

			await db.query(`insert into comments (body, author_id, review_id, comment_id, created_at, updated_at)`,
				[body, author_id, review_id, comment_id, Date.now(), Date.now()])

			return res.status(200)
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async addRole(req, res) {
		try {
			const {id, role} = req.body
			if (!id || !role) res.status(400).json({"error": "Not enough data"})
			const user = await db.query(`select id from users where id = $1`, [id])
			if (!user.rows[0]) return res.status(404).json({"error": "User not found"})
			const candidate = await db.query(`select id from user_role where user_id = $1 and role_id = $2`)

			if (!candidate) {
				await db.query(`insert into user_role (user_id, role_id) values ($1, $2)`, [id, role])
				return res.status(200)
			}

			return res.status(400).json({"error": "User already have this role"})
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}

	async removeRole(req, res) {
		try {
			const {id, role} = req.body
			if (!id || !role) res.status(400).json({"error": "Not enough data"})
			const user = await db.query(`select id from users where id = $1`, [id])
			if (!user.rows[0]) return res.status(404).json({"error": "User not found"})
			const candidate = await db.query(`select id from user_role where user_id = $1 and role_id = $2`)

			if (candidate) {
				await db.query(`delete from user_role where user_id = $1 and role_id = $2`, [id, role])
				return res.status(200)
			}

			return res.status(400).json({"error": "User already have this role"})
		} catch (e) {
			return res.status(401).json({"error": "Something went wrong"})
		}
	}
}

module.exports = new UserController()