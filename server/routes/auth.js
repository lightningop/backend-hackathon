const express = require('express');
const { register, login, getMe, assignRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
// Manager-only: assign privileged roles (LEGAL, MANAGER) to existing users
router.patch('/assign-role', protect, authorize('MANAGER'), assignRole);

module.exports = router;
