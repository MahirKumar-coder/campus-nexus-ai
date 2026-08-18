const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decode = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await User.findById(decode.id).select('-password')
            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' })
            }

            next()
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' })
    }
}

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this route`,  
            })
        }
        next()
    }
}

module.exports = { authMiddleware, authorize }