const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action:        { type: String, required: true },
    performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetPerson:  { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    details:       { type: String, default: '' },
    ipAddress:     { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
