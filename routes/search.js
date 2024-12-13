const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { model } = require('mongoose');

// Fetch by search
router.get('/:searchTerm', async (req, res) => {
	const limit = parseInt(req.query.limit) || 10;
	const page = parseInt(req.query.page) || 1;
	const skip = (page - 1) * limit;

	const searchTerm = req.params.searchTerm;
	try {
		let searchQuery = {};

		if (searchTerm) {
			searchQuery = {
				$or: [
					{ name: { $regex: searchTerm, $options: 'i' } },
					{ description: { $regex: searchTerm, $options: 'i' } },
					{ categories: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
				],
			};
		}

		const products = await Product.find(searchQuery).skip(skip).limit(limit);

		res.json(products);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
