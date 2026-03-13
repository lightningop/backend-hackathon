const mongoose = require('mongoose');

const caseFileSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
      unique: true
    },
    triageBrief: {
      priorityLevel:    { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
      summary:          { type: String, default: '' },
      topNeeds:         [{ type: String }],
      recommendedSteps: [{ type: String }],
      generatedAt:      { type: Date }
    },
    notes: [
      {
        author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role:      String,
        content:   String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    assignedOfficers: [
      {
        user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role:       String,
        assignedAt: { type: Date, default: Date.now }
      }
    ],
    facilityHistory: [
      {
        facility:  String,
        arrivedAt: Date,
        leftAt:    Date
      }
    ],
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaseFile', caseFileSchema);
