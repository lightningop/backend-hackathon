const CaseFile = require('../models/CaseFile');
const FamilyLink = require('../models/FamilyLink');
const Person = require('../models/Person');
const AuditLog = require('../models/AuditLog');

const addNote = async (req, res) => {
  const { content } = req.body;

  const caseFile = await CaseFile.findOne({ person: req.params.personId });
  if (!caseFile) return res.status(404).json({ success: false, message: 'Case file not found' });

  caseFile.notes.push({ author: req.user._id, role: req.user.role, content });
  caseFile.lastUpdatedBy = req.user._id;
  await caseFile.save();

  res.json({ success: true, caseFile });
};

const linkFamily = async (req, res) => {
  const { personAId, personBId, relationship } = req.body;

  const existing = await FamilyLink.findOne({
    $or: [
      { personA: personAId, personB: personBId },
      { personA: personBId, personB: personAId }
    ]
  });

  if (existing) {
    return res.status(400).json({ success: false, message: 'Family link already exists' });
  }

  const link = await FamilyLink.create({
    personA: personAId,
    personB: personBId,
    relationship,
    linkedBy: req.user._id
  });

  // NOTE: familySeparated flag is intentionally NOT auto-cleared here.
  // It must be cleared manually by an officer after verifying the reunion
  // to preserve the audit trail and prevent accidental data loss.

  await AuditLog.create({
    action: 'FAMILY_LINKED',
    performedBy: req.user._id,
    targetPerson: personAId,
    ipAddress: req.ip,
    details: `Linked person ${personAId} and ${personBId} as ${relationship}`
  });

  res.status(201).json({ success: true, link });
};

const getFamilyLinks = async (req, res) => {
  const links = await FamilyLink.find({
    $or: [{ personA: req.params.personId }, { personB: req.params.personId }]
  })
    .populate('personA', 'firstName lastName caseId caseType currentStatus')
    .populate('personB', 'firstName lastName caseId caseType currentStatus');

  res.json({ success: true, links });
};

const getStats = async (req, res) => {
  const [total, refugees, asylumSeekers, idps, medicalFlags, familySeparated] =
    await Promise.all([
      Person.countDocuments(),
      Person.countDocuments({ caseType: 'REFUGEE' }),
      Person.countDocuments({ caseType: 'ASYLUM_SEEKER' }),
      Person.countDocuments({ caseType: 'IDP' }),
      Person.countDocuments({ 'flags.medicalEmergency': true }),
      Person.countDocuments({ 'flags.familySeparated': true })
    ]);

  res.json({ success: true, stats: { total, refugees, asylumSeekers, idps, medicalFlags, familySeparated } });
};

module.exports = { addNote, linkFamily, getFamilyLinks, getStats };
