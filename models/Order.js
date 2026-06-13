const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HAY-${timestamp}${random}`;
}

const Order = sequelize.define('Order', {
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
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: generateOrderNumber()
    },
    items: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('items');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('items', JSON.stringify(value));
        }
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
            const raw = this.getDataValue('shippingAddress');
            return raw ? JSON.parse(raw) : {};
        },
        set(value) {
            this.setDataValue('shippingAddress', JSON.stringify(value));
        }
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    tax: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('pay_on_delivery', 'card', 'bank_transfer', 'paystack', 'flutterwave'),
        defaultValue: 'pay_on_delivery'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    paymentReference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estimatedDelivery: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    refundAmount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    refundedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Orders'
});

module.exports = Order;