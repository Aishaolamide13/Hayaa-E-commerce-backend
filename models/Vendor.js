const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vendor = sequelize.define('Vendor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id'
    },
    storeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    storeSlug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    storeDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    storeLogo: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    storeBanner: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true }
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
            const raw = this.getDataValue('address');
            return raw ? JSON.parse(raw) : {};
        },
        set(value) {
            this.setDataValue('address', JSON.stringify(value));
        }
    },
    isHalalCertified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    halalCertificateUrl: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    complianceStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
        defaultValue: 'pending'
    },
    verificationStatus: {
        type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
        defaultValue: 'unverified'
    },
    verificationDocuments: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('verificationDocuments');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('verificationDocuments', JSON.stringify(value));
        }
    },
    businessRegistrationNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    specialties: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('specialties');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('specialties', JSON.stringify(value));
        }
    },
    paymentInfo: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
            const raw = this.getDataValue('paymentInfo');
            return raw ? JSON.parse(raw) : {};
        },
        set(value) {
            this.setDataValue('paymentInfo', JSON.stringify(value));
        }
    },
    commissionRate: {
        type: DataTypes.FLOAT,
        defaultValue: 5
    },
    totalSales: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalProducts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: { min: 0, max: 5 }
    },
    ratingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Vendors'
});

module.exports = Vendor;