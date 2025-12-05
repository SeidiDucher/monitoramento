const mongoose = require("mongoose");

const consumoSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  totalLitros: { type: Number, required: true },
  timestamp: { type: Number, required: true, index: true }
}, {
  timestamps: false
});

module.exports = mongoose.model("Consumo", consumoSchema);
