const mongoose = require('mongoose');

const LightStates = new mongoose.Schema({
  name: String,
  isOpen: Boolean
});

module.exports = mongoose.model('LightStates', LightStates,'light_states');
