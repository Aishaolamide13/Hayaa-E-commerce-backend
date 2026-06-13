const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'vendor_id'
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'order_id'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    images: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('images');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    isVerifiedPurchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    adminReply: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
            const raw = this.getDataValue('adminReply');
            return raw ? JSON.parse(raw) : {};
        },
        set(value) {
            this.setDataValue('adminReply', JSON.stringify(value));
        }
    },
    vendorReply: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
            const raw = this.getDataValue('vendorReply');
            return raw ? JSON.parse(raw) : {};
        },
        set(value) {
            this.setDataValue('vendorReply', JSON.stringify(value));
        }
    }
}, {
    tableName: 'Reviews',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id']
        }
    ]
});

module.exports = Review;