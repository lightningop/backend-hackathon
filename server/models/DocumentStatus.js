const mongoose = require('mongoose');

const documentStatusSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true
    },
    documentType: {
      type: String,
      enum: [
        'PASSPORT', 'NATIONAL_ID', 'UNHCR_CERTIFICATE',
        'ASYLUM_APPLICATION', 'REFERRAL_LETTER',
        'MEDICAL_RECORD', 'BIRTH_CERTIFICATE', 'OTHER'
      ],
      required: true
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'PENDING', 'VERIFIED', 'MISSING'],
      default: 'PENDING'
    },
    fileData:   { type: String, default: '' },
    fileName:   { type: String, default: '' },
    notes:      { type: String, default: '' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentStatus', documentStatusSchema);
