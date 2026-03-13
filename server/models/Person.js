const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      default: () => 'BB-' + Date.now().toString(36).toUpperCase()
    },
    caseType: {
      type: String,
      enum: ['REFUGEE', 'ASYLUM_SEEKER', 'IDP'],
      required: true
    },

    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
    },
    nationality: { type: String, default: '' },
    languages:   [{ type: String }],
    phone:       { type: String, default: '' },

    originCountry:      { type: String, default: '' },
    originRegion:       { type: String, default: '' },
    flightDate:         { type: Date },
    transitCountries:   [{ type: String }],
    persecutionGrounds: { type: String, default: '' },
    displacementCause: {
      type: String,
      enum: ['CONFLICT', 'DISASTER', 'VIOLENCE', 'OTHER', ''],
      default: ''
    },
    asylumNarrative: { type: String, default: '' },
    unhcrRef:        { type: String, default: '' },

    // Fixed: enum constraint on currentStatus
    currentStatus: {
      type: String,
      enum: ['REGISTERED', 'IN_REVIEW', 'REFERRED', 'TRANSFERRED', 'CLOSED'],
      default: 'REGISTERED'
    },
    statusHistory: [
      {
        status:    String,
        date:      { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note:      String
      }
    ],

    flags: {
      medicalEmergency:    { type: Boolean, default: false },
      unaccompaniedMinor:  { type: Boolean, default: false },
      traffickingIndicator:{ type: Boolean, default: false },
      asylumClaim:         { type: Boolean, default: false },
      familySeparated:     { type: Boolean, default: false }
    },

    currentFacility: { type: String, default: '' },
    entryPoint:      { type: String, default: '' },
    entryDate:       { type: Date, default: Date.now },
    qrCode:          { type: String, default: '' },
    registeredBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', personSchema);
