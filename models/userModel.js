const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // your schema fields here
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
