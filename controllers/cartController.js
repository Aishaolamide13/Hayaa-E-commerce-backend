const { Op } = require('sequelize');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Get user cart
// @route   GET /api/cart
const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ where: { userId: req.user.id } });

        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, items: [] });
        }

        // Populate product details for each item
        const items = cart.items || [];
        const populatedItems = [];
        for (const item of items) {
            const product = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images', 'stock', 'status', 'vendorId'],
                include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'storeName', 'storeSlug'] }]
            });
            populatedItems.push({ ...item, productDetails: product || null });
        }

        res.status(200).json({
            success: true,
            data: { ...cart.toJSON(), items: populatedItems }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1, variant } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${product.stock} items available.`
            });
        }

        let cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, items: [] });
        }

        const items = cart.items;

        // Check if product already in cart
        const existingItemIndex = items.findIndex(item => {
            const sameProduct = item.product === productId;
            const sameVariant = variant
                ? item.variant?.name === variant.name && item.variant?.value === variant.value
                : !item.variant?.name;
            return sameProduct && sameVariant;
        });

        if (existingItemIndex > -1) {
            // Update quantity
            const newQty = items[existingItemIndex].quantity + quantity;
            if (newQty > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Only ${product.stock} items available.`
                });
            }
            items[existingItemIndex].quantity = newQty;
            items[existingItemIndex].price = product.price;
        } else {
            // Add new item
            let itemPrice = product.price;
            if (variant && product.attributes && product.attributes.length > 0) {
                const matchedAttr = product.attributes.find(
                    a => a.name === variant.name && a.value === variant.value
                );
                if (matchedAttr && matchedAttr.price) {
                    itemPrice = matchedAttr.price;
                }
            }

            items.push({
                product: productId,
                variant: variant || undefined,
                quantity,
                price: itemPrice,
                total: itemPrice * quantity
            });
        }

        // Recalculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.items = items;
        cart.subtotal = subtotal;
        cart.total = subtotal + cart.shippingCost + cart.tax - cart.discountAmount;
        await cart.save();

        // Populate and return
        const populatedItems = [];
        for (const item of cart.items) {
            const prod = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images', 'stock', 'vendorId'],
                include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'storeName', 'storeSlug'] }]
            });
            populatedItems.push({ ...item, productDetails: prod || null });
        }

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: { ...cart.toJSON(), items: populatedItems }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        let cart = await Cart.findOne({ where: { userId: req.user.id } });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const items = cart.items;
        const itemIndex = parseInt(req.params.itemId);

        if (itemIndex < 0 || itemIndex >= items.length) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        if (quantity <= 0) {
            items.splice(itemIndex, 1);
        } else {
            const product = await Product.findByPk(items[itemIndex].product);
            if (product && quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock. Only ${product.stock} items available.`
                });
            }
            items[itemIndex].quantity = quantity;
            items[itemIndex].total = items[itemIndex].price * quantity;
        }

        // Recalculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.items = items;
        cart.subtotal = subtotal;
        cart.total = subtotal + cart.shippingCost + cart.tax - cart.discountAmount;
        await cart.save();

        // Populate
        const populatedItems = [];
        for (const item of cart.items) {
            const prod = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images', 'stock', 'vendorId'],
                include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'storeName', 'storeSlug'] }]
            });
            populatedItems.push({ ...item, productDetails: prod || null });
        }

        res.status(200).json({
            success: true,
            data: { ...cart.toJSON(), items: populatedItems }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
const removeFromCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const items = cart.items;
        const itemIndex = parseInt(req.params.itemId);

        if (itemIndex >= 0 && itemIndex < items.length) {
            items.splice(itemIndex, 1);
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.items = items;
        cart.subtotal = subtotal;
        cart.total = subtotal + cart.shippingCost + cart.tax - cart.discountAmount;
        await cart.save();

        // Populate
        const populatedItems = [];
        for (const item of cart.items) {
            const prod = await Product.findByPk(item.product, {
                attributes: ['id', 'name', 'slug', 'price', 'images', 'stock', 'vendorId'],
                include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'storeName', 'storeSlug'] }]
            });
            populatedItems.push({ ...item, productDetails: prod || null });
        }

        res.status(200).json({
            success: true,
            data: { ...cart.toJSON(), items: populatedItems }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (cart) {
            cart.items = [];
            cart.subtotal = 0;
            cart.total = 0;
            await cart.save();
        }

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};