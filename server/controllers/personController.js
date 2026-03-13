const Person = require('../models/Person');
const CaseFile = require('../models/CaseFile');
const AuditLog = require('../models/AuditLog');
const { generateTriageBrief } = require('../services/ai');
const { generateQR } = require('../services/qr');

const createPerson = async (req, res) => {
  const personData = { ...req.body, registeredBy: req.user._id };

  const person = await Person.create(personData);

  const qrCode = await generateQR(person.caseId);
  person.qrCode = qrCode;
  person.statusHistory.push({
    status: 'REGISTERED',
    updatedBy: req.user._id,
    note: 'Initial registration'
  });
  await person.save();

  let triageBrief = null;
  try {
    triageBrief = await generateTriageBrief(person);
  } catch (err) {
    console.error('AI triage error:', err.message);
  }

  const caseFile = await CaseFile.create({
    person: person._id,
    triageBrief: triageBrief ? { ...triageBrief, generatedAt: new Date() } : undefined,
    lastUpdatedBy: req.user._id
  });

  await AuditLog.create({
    action: 'PERSON_REGISTERED',
    performedBy: req.user._id,
    targetPerson: person._id,
    ipAddress: req.ip,
    details: `Registered ${person.firstName} ${person.lastName} as ${person.caseType}`
  });

  res.status(201).json({ success: true, person, caseFile });
};

const getPersons = async (req, res) => {
  const { caseType, status, search } = req.query;
  const filter = {};

  if (caseType) filter.caseType = caseType;
  if (status)   filter.currentStatus = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { caseId:    { $regex: search, $options: 'i' } }
    ];
  }

  // MEDICAL role can only see persons with medical emergency flag
  if (req.user.role === 'MEDICAL') {
    filter['flags.medicalEmergency'] = true;
  }

  const persons = await Person.find(filter)
    .sort({ createdAt: -1 })
    .populate('registeredBy', 'name role')
    .limit(100);

  // Strip sensitive legal/asylum fields for MEDICAL role
  const sanitized = persons.map(p => {
    const obj = p.toObject();
    if (req.user.role === 'MEDICAL') {
      delete obj.asylumNarrative;
      delete obj.persecutionGrounds;
      delete obj.persecutionGrounds;
      delete obj.unhcrRef;
    }
    return obj;
  });

  res.json({ success: true, count: sanitized.length, persons: sanitized });
};

const getPersonByCaseId = async (req, res) => {
  const person = await Person.findOne({ caseId: req.params.caseId })
    .populate('registeredBy', 'name role');

  if (!person) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const caseFile = await CaseFile.findOne({ person: person._id })
    .populate('notes.author', 'name role')
    .populate('assignedOfficers.user', 'name role');

  // Strip sensitive legal/asylum fields for MEDICAL role
  const personData = person.toObject();
  if (req.user.role === 'MEDICAL') {
    delete personData.asylumNarrative;
    delete personData.persecutionGrounds;
    delete personData.unhcrRef;
  }

  res.json({ success: true, person: personData, caseFile });
};

const updateStatus = async (req, res) => {
  const { status, note } = req.body;

  const person = await Person.findById(req.params.id);
  if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

  person.currentStatus = status;
  person.statusHistory.push({ status, updatedBy: req.user._id, note: note || '' });
  await person.save();

  await AuditLog.create({
    action: 'STATUS_UPDATED',
    performedBy: req.user._id,
    targetPerson: person._id,
    ipAddress: req.ip,
    details: `Status changed to ${status}`
  });

  res.json({ success: true, person });
};

const updateFlags = async (req, res) => {
  const person = await Person.findById(req.params.id);
  if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

  Object.assign(person.flags, req.body);
  await person.save();

  await AuditLog.create({
    action: 'FLAG_UPDATED',
    performedBy: req.user._id,
    targetPerson: person._id,
    ipAddress: req.ip,
    details: `Flags updated: ${JSON.stringify(req.body)}`
  });

  res.json({ success: true, flags: person.flags });
};

module.exports = { createPerson, getPersons, getPersonByCaseId, updateStatus, updateFlags };
