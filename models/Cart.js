const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cart = sequelize.define('Cart', {
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
    subtotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    tax: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    total: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    couponCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    tableName: 'Carts'
});

module.exports = Cart;