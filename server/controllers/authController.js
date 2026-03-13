const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// Roles that can be self-assigned at registration.
// MANAGER and LEGAL must be assigned by an existing MANAGER.
const SELF_REGISTER_ROLES = ['BORDER_OFFICER', 'MEDICAL', 'SHELTER'];

const register = async (req, res) => {
  const { name, email, password, role, organization } = req.body;

  if (!SELF_REGISTER_ROLES.includes(role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${role}' cannot be self-assigned. Contact a manager to be assigned this role.`
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role, organization });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// Manager-only: assign any role to a user by ID
const assignRole = async (req, res) => {
  const { userId, role } = req.body;
  const ROLES = ['BORDER_OFFICER', 'MEDICAL', 'LEGAL', 'SHELTER', 'MANAGER'];

  if (!ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, user });
};

module.exports = { register, login, getMe, assignRole };
