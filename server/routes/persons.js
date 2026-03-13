const express = require('express');
const {
  createPerson, getPersons, getPersonByCaseId, updateStatus, updateFlags
} = require('../controllers/personController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/',            protect, authorize('BORDER_OFFICER', 'MANAGER'), createPerson);
router.get('/',             protect, getPersons);
// Fixed: require authentication — QR scanner must be logged in to view person details
router.get('/:caseId',      protect, getPersonByCaseId);
router.patch('/:id/status', protect, authorize('BORDER_OFFICER', 'LEGAL', 'MANAGER'), updateStatus);
router.patch('/:id/flags',  protect, authorize('BORDER_OFFICER', 'MEDICAL', 'MANAGER'), updateFlags);

module.exports = router;
