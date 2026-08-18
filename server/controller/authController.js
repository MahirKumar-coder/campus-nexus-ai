const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    })
}

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, department, semester } = req.body

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department,
            semester: role === 'student' ? semester : undefined,
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
} 

// @desc Authenticate user & get token
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email }).select('password')
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc Get current logged in user profile
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
    res.status(200).json(req.user)
}