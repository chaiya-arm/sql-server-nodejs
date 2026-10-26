// routes/profiles.js — เส้นทางโปรไฟล์ผู้ใช้ (One-to-One: user ↔ profile)

const express = require('express');
const router = express.Router();

const ProfileController = require('../controllers/ProfileController');
const validate = require('../middlewares/ValidateMiddleware');

router.get('/', ProfileController.index);                                     // + user
router.get('/:id', ProfileController.show);
router.post('/', validate(['user_id']), ProfileController.store);
router.put('/:id', ProfileController.update);
router.delete('/:id', ProfileController.destroy);

module.exports = router;
