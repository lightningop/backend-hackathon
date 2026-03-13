const mongoose = require('mongoose');

const familyLinkSchema = new mongoose.Schema(
  {
    personA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true
    },
    personB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true
    },
    relationship: {
      type: String,
      enum: ['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'OTHER'],
      required: true
    },
    confirmed: { type: Boolean, default: false },
    linkedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyLink', familyLinkSchema);
