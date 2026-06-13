const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');

const setupAssociations = () => {
    // User - Vendor (one-to-one)
    User.hasOne(Vendor, { foreignKey: 'userId', as: 'vendor' });
    Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User - Cart (one-to-one)
    User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
    Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User - Order (one-to-many)
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
    Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User - Review (one-to-many)
    User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
    Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Vendor - Product (one-to-many)
    Vendor.hasMany(Product, { foreignKey: 'vendorId', as: 'products' });
    Product.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

    // Vendor - Review (one-to-many)
    Vendor.hasMany(Review, { foreignKey: 'vendorId', as: 'reviews' });
    Review.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

    // Category - Product (one-to-many)
    Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
    Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

    // Category self-referencing (parent-child)
    Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
    Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

    // Product - Review (one-to-many)
    Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
    Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // Order - User (already defined above)

    // Product subcategory
    Product.belongsTo(Category, { foreignKey: 'subcategoryId', as: 'subcategory' });
};

module.exports = setupAssociations;