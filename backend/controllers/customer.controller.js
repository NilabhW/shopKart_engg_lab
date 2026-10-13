const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken')

const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;


        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be atleast 6 characters'
            })
        }

        const existingCustomer = await Customer.findOne({ $or: [{ email }, { phone }] })
        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: existingCustomer.email === email
                    ? 'Email already exists'
                    : 'Phone number already exists',
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await Customer.create({
            fullName, email, password: hashedPassword, phone
        })

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone,
            }
        })




    }

    catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field'
            return res.status(409).json({
                success: false,
                message: `${field === 'email' ? 'Email' : 'Phone number'} already exists`,
            })
        }

        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        })

    }

}


const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            })

        }

        const customer = await Customer.findOne({ email })
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            })
        }


        const isMatch = await bcrypt.compare(password, customer.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            })

        }

        const token = generateToken(customer._id)

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
        })

    }


    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message,
        })
    }
}


const getProfile = async (req, res) => {
    res.status(200).json(req.user);

}

const logoutCustomer = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

module.exports = { registerCustomer, loginCustomer, getProfile, logoutCustomer }