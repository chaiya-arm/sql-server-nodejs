// routes/customers.js — เส้นทางลูกค้า (One-to-Many → invoices)

const express = require('express');
const router = express.Router();

const CustomerController = require('../controllers/CustomerController');
const validate = require('../middlewares/ValidateMiddleware');

router.get('/', CustomerController.index);                                 // + invoices
router.get('/:id', CustomerController.show);
router.post('/', validate(['c_id', 'c_name']), CustomerController.store);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.destroy);

module.exports = router;
