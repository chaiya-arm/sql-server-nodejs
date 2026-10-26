// routes/sellers.js — เส้นทางผู้ขาย (One-to-Many → invoices)

const express = require('express');
const router = express.Router();

const SellerController = require('../controllers/SellerController');
const validate = require('../middlewares/ValidateMiddleware');

router.get('/', SellerController.index);                                 // + invoices
router.get('/:id', SellerController.show);
router.post('/', validate(['s_id', 's_name']), SellerController.store);
router.put('/:id', SellerController.update);
router.delete('/:id', SellerController.destroy);

module.exports = router;
