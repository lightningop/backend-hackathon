const express = require('express');
const { generateTriageBrief } = require('../services/ai');
const CaseFile = require('../models/CaseFile');
const Person = require('../models/Person');
const { protect } = require('../middleware/auth');

const router = express.Router();

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