const mongoose = require('mongoose');

const customCommandSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true, lowercase: true },
  response: { type: String, required: true },
  isEmbed: { type: Boolean, default: false },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

customCommandSchema.index({ guildId: 1, trigger: 1 }, { unique: true });

module.exports = mongoose.model('CustomCommand', customCommandSchema);
