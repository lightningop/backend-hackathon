const express = require('express');
const { generateTriageBrief, translateAndSummarize } = require('../services/ai');
const CaseFile = require('../models/CaseFile');
const Person = require('../models/Person');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/triage/translate
router.post('/translate', protect, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    return res.status(400).json({ success: false, message: 'No text provided' });
  }
  const result = await translateAndSummarize(rawText);
  res.json({ success: true, ...result });
});

// POST /api/triage/:personId
router.post('/:personId', protect, async (req, res) => {
  const person = await Person.findById(req.params.personId);
  if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

  const brief = await generateTriageBrief(person);

  const caseFile = await CaseFile.findOneAndUpdate(
    { person: person._id },
    { triageBrief: { ...brief, generatedAt: new Date() } },
    { new: true }
  );

  res.json({ success: true, triageBrief: caseFile.triageBrief });
});

module.exports = router;