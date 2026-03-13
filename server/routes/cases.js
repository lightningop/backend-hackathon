const express = require('express');
const { addNote, linkFamily, getFamilyLinks, getStats } = require('../controllers/caseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/:personId/notes',   protect, addNote);
router.post('/family-link',       protect, authorize('BORDER_OFFICER', 'MANAGER'), linkFamily);
router.get('/family/:personId',   protect, getFamilyLinks);
router.get('/stats/overview',     protect, authorize('MANAGER'), getStats);

module.exports = router;