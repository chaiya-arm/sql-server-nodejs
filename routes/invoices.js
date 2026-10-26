// routes/invoices.js — เส้นทางออเดอร์/ใบเสร็จ (belongsTo → customer/seller/product)

const express = require('express');
const router = express.Router();

const InvoiceController = require('../controllers/InvoiceController');
const validate = require('../middlewares/ValidateMiddleware');

router.get('/', InvoiceController.index);                                                       // + customer/seller/product
router.get('/:id', InvoiceController.show);
router.post('/', validate(['inv_id', 'c_id', 's_id', 'p_id', 'quantity']), InvoiceController.store);
router.put('/:id', InvoiceController.update);
router.delete('/:id', InvoiceController.destroy);

module.exports = router;
