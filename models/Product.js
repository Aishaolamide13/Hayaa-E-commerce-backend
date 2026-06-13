const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'vendor_id'
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    shortDescription: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id'
    },
    subcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'subcategory_id'
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0 }
    },
    comparePrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0 }
    },
    costPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0 }
    },
    discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
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
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isHalal: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    halalCertification: {
        type: DataTypes.STRING,
        allowNull: true
    },
    islamicTags: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('islamicTags');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('islamicTags', JSON.stringify(value));
        }
    },
    attributes: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('attributes');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('attributes', JSON.stringify(value));
        }
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0 }
    },
    dimensions: {
        type: DataTypes.TEXT,
        defaultValue: '{}',
        get() {
            const raw = this.getDataValue('dimensions');
            return raw ? JSON.parse(raw) : {};
        },
        set(value) {
            this.setDataValue('dimensions', JSON.stringify(value));
        }
    },
    isFreeShipping: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    shippingPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected', 'archived'),
        defaultValue: 'draft'
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    totalSold: {
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
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Products',
    hooks: {
        beforeSave: (product) => {
            if (product.comparePrice && product.price) {
                product.discount = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
            }
        }
    }
});

module.exports = Product;