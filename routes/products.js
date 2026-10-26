// routes/products.js — เส้นทางสินค้า (One-to-Many → invoices)

const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/ProductController');
const validate = require('../middlewares/ValidateMiddleware');

router.get('/', ProductController.index);                                        // + invoices
router.get('/:id', ProductController.show);
router.post('/', validate(['p_id', 'p_name', 'p_price']), ProductController.store);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.destroy);

module.exports = router;
