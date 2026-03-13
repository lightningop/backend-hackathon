const express = require('express');
const DocumentStatus = require('../models/DocumentStatus');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// Any authenticated user can view documents for a person
router.get('/:personId', protect, async (req, res) => {
  const docs = await DocumentStatus.find({ person: req.params.personId });
  res.json({ success: true, documents: docs });
});

// Fixed: only officers, legal, and managers can upload documents
router.post('/:personId', protect, authorize('BORDER_OFFICER', 'LEGAL', 'MANAGER'), async (req, res) => {
  const { documentType, status, fileData, fileName, notes } = req.body;
  const doc = await DocumentStatus.create({
    person: req.params.personId,
    documentType, status, fileData, fileName, notes
  });
  res.status(201).json({ success: true, document: doc });
});

// Fixed: only legal and managers can verify/update documents
router.patch('/:docId', protect, authorize('LEGAL', 'MANAGER'), async (req, res) => {
  const doc = await DocumentStatus.findByIdAndUpdate(
    req.params.docId,
    { ...req.body, verifiedBy: req.user._id },
    { new: true }
  );
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, document: doc });
});

module.exports = router;
