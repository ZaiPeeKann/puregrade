const db = require('../db')
const uuid = require('uuid')
const path = require("path");

class ProductController {
	async create(req, res) {
		const {title, type, platform, genre} = req.body
		const {image} = req.files
		let filename = uuid.v4() + ".jpg"
		if (image) {
			image.mv(path.resolve(__dirname, '..', 'static', filename))
		} else {
			filename = "no-image.jpg"
		}

		const product = await db.query(`insert into products (id, title, type, image, release_date, created_at) values ($1, $2, $3, $4, $5, $6) returning *`, [])
		db.query(`insert into product_platform () values ()`, [])

		return res.status(200).json(product.rows[0])
	}
	async delete(req, res) {

	}
	async get(req, res) {

	}
	async getAll(req, res) {

	}
	async getAllPlatforms(req, res) {

	}
	async getAllGenres(req, res) {

	}
	async getAllTypes(req, res) {

	}
}

module.exports = new ProductController()