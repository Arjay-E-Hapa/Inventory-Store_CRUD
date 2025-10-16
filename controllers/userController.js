const User = require('../models/userModel');
// Get all users
exports.getUsers = async (req, res) => {
try {
const users = await User.find();
res.json(users);
} catch (err) {
res.status(500).json({ error: err.message });
}
};
// Get user by ID
exports.getUser = async (req, res) => {
try {
const user = await User.findById(req.params.id);
if (!user) return res.status(404).json({ error: 'User not found' });
res.json(user);
} catch (err) {
res.status(500).json({ error: err.message });
}
};
// Create user
exports.createUser = async (req, res) => {
try {
const newUser = await User.create(req.body);
res.status(201).json(newUser);
} catch (err) {
res.status(500).json({ error: err.message });
}
};
// Update user
exports.updateUser = async (req, res) => {
try {
const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true
});
res.json(updatedUser);
} catch (err) {
res.status(500).json({ error: err.message });
}
};

// Delete user
exports.deleteUser = async (req, res) => {
try {
await User.findByIdAndDelete(req.params.id);
res.json({ message: 'User deleted' });
} catch (err) {
res.status(500).json({ error: err.message });
}
};
