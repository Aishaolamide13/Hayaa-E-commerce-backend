const { Op } = require('sequelize');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const user = await User.create({ name, email, password, phone });
        const token = user.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Contact support.'
            });
        }

        const token = user.generateAuthToken();

        // If user is a vendor, get vendor info
        let vendor = null;
        if (user.role === 'vendor') {
            vendor = await Vendor.findOne({ where: { userId: user.id } });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                vendor: vendor ? {
                    id: vendor.id,
                    storeName: vendor.storeName,
                    storeSlug: vendor.storeSlug,
                    complianceStatus: vendor.complianceStatus,
                    verificationStatus: vendor.verificationStatus
                } : null,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        let vendor = null;
        if (user.role === 'vendor') {
            vendor = await Vendor.findOne({ where: { userId: user.id } });
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toJSON(),
                vendor
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByPk(req.user.id);

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
const addAddress = async (req, res, next) => {
    try {
        const { fullName, phone, street, city, state, zipCode, isDefault } = req.body;
        const user = await User.findByPk(req.user.id);

        const addresses = user.shippingAddresses;

        if (isDefault) {
            addresses.forEach(addr => { addr.isDefault = false; });
        }

        addresses.push({
            fullName,
            phone,
            street,
            city,
            state,
            zipCode,
            isDefault: isDefault || addresses.length === 0
        });

        user.shippingAddresses = addresses;
        await user.save();

        res.status(201).json({
            success: true,
            data: user.shippingAddresses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:id
const deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        // req.params.id is the array index in the serialized form, or we use index
        // The original used _id from Mongoose subdocuments. We use array index instead.
        const index = parseInt(req.params.id);
        const addresses = user.shippingAddresses;
        
        if (index >= 0 && index < addresses.length) {
            addresses.splice(index, 1);
        }
        
        user.shippingAddresses = addresses;
        await user.save();

        res.status(200).json({
            success: true,
            data: user.shippingAddresses
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    updatePassword,
    addAddress,
    deleteAddress
};