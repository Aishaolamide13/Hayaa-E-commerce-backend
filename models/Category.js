const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'parent_id'
    },
    islamicType: {
        type: DataTypes.ENUM(
            'Clothing_&_Modest_Fashion',
            'Prayer_&_Worship',
            'Quran_&_Islamic_Knowledge',
            'Halal_Food_&_Beverages',
            'Home_&_Lifestyle',
            'Personal_Care_&_Fragrance',
            'Gifts_&_Occasions',
            'Digital_&_Media',
            'Children_&_Family',
            'Hajj_&_Umrah',
            'Other'
        ),
        defaultValue: 'Other'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'Categories'
});

module.exports = Category;